/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ApplicationCommandInputType, sendBotMessage } from "@api/Commands";
import { UserAreaButton, UserAreaRenderProps } from "@api/UserArea";
import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { FluxDispatcher, React, SelectedChannelStore, UserStore } from "@webpack/common";

// ─── Webpack Modülleri ─────────────────────────────────────────────────────────
const ChannelActions  = findByPropsLazy("selectVoiceChannel", "disconnect");
const VoiceStateStore = findByPropsLazy("getVoiceStateForUser", "getVoiceStatesForChannel");
const ChannelStore    = findByPropsLazy("getChannel", "getDMFromUserId");
const CallActions     = findByPropsLazy("startCall", "stopCall");

// ─── State ─────────────────────────────────────────────────────────────────────
let dualEnabled  = false;
let dmChannelId  : string | null = null; // korunan DM ses araması kanalı
let reconnecting = false;

// ─── DM aramasını koru ───────────────────────────────────────────────────────
function onVoiceStateUpdate(event: any) {
    if (!dualEnabled || reconnecting || !dmChannelId) return;
    const me = UserStore.getCurrentUser()?.id;
    if (!event.userId || event.userId !== me) return;

    // DM kanalından disconnect olduk → geri bağlan
    if (event.channelId === null && !event.guildId) {
        const channel = ChannelStore?.getChannel?.(dmChannelId);
        // Gerçekten bir DM kanalı mı?
        if (!channel || channel.guild_id) return;

        console.log("[DualVoice] DM aramasından atıldık, geri bağlanıyoruz...");
        reconnecting = true;
        setTimeout(() => {
            // Yöntem 1: startCall
            try {
                if (typeof CallActions?.startCall === "function") {
                    CallActions.startCall({ channelId: dmChannelId });
                    reconnecting = false;
                    return;
                }
            } catch (_) { /* */ }
            // Yöntem 2: CALL_CONNECT dispatch
            FluxDispatcher.dispatch({
                type: "CALL_CONNECT",
                channelId: dmChannelId,
                currentVoiceChannelId: null,
            });
            reconnecting = false;
        }, 600);
    }
}

// ─── Simge ────────────────────────────────────────────────────────────────────
function DualVoiceIcon({ active }: { active: boolean; }) {
    const color = active ? "#57f287" : "currentColor";
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2"  y="3"  width="8" height="7" rx="1" stroke={color} strokeWidth="2" />
            <rect x="14" y="3"  width="8" height="7" rx="1" stroke={color} strokeWidth="2" />
            <path d="M6 10v4M18 10v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M3 18h6M15 18h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// ─── Kullanıcı Alanı Butonu ───────────────────────────────────────────────────
function DualVoiceButton(_: UserAreaRenderProps) {
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    const toggle = () => {
        if (!dualEnabled) {
            // Şu an DM sesinde miyiz?
            const chId = SelectedChannelStore?.getVoiceChannelId?.();
            if (!chId) return;
            const channel = ChannelStore?.getChannel?.(chId);
            // DM veya Grup DM kanalı mı? (guild_id yoksa DM)
            if (!channel || channel.guild_id) return;

            dmChannelId = chId;
            dualEnabled = true;
            reconnecting = false;
            FluxDispatcher.subscribe("VOICE_STATE_UPDATE" as any, onVoiceStateUpdate);
            console.log(`[DualVoice] DM araması korunuyor: ${dmChannelId}`);
        } else {
            dualEnabled  = false;
            dmChannelId  = null;
            FluxDispatcher.unsubscribe("VOICE_STATE_UPDATE" as any, onVoiceStateUpdate);
            console.log("[DualVoice] Devre dışı.");
        }
        forceUpdate();
    };

    return (
        <UserAreaButton
            onClick={toggle}
            tooltipText={
                dualEnabled
                    ? "DualVoice: DM araması korunuyor | Kapat"
                    : "DualVoice: DM sesindeyken aç, sonra sunucu sesine katıl"
            }
            icon={<DualVoiceIcon active={dualEnabled} />}
            role="switch"
            aria-checked={dualEnabled}
            redGlow={false}
            plated={false}
        />
    );
}

// ─── Plugin ───────────────────────────────────────────────────────────────────
export default definePlugin({
    name: "DualVoice",
    description: "Keeps your DM call active while you join a server voice channel.",
    descriptionTr: "Bir sunucunun ses kanalına katılırken DM aramanı aktif tutar.",
    authors: [{ name: "Selycord", id: 0n }],
    enabledByDefault: false,
    dependencies: ["CommandsAPI", "UserAreaAPI"],

    userAreaButton: {
        icon: () => <DualVoiceIcon active={dualEnabled} />,
        render: DualVoiceButton,
    },

    commands: [
        {
            name: "dualvoice",
            description: "DualVoice kontrolü",
            inputType: ApplicationCommandInputType.BUILT_IN,
            options: [
                {
                    name: "action",
                    description: "start | stop | status",
                    type: 3,
                    required: true,
                    choices: [
                        { label: "start",  name: "start",  value: "start"  },
                        { label: "stop",   name: "stop",   value: "stop"   },
                        { label: "status", name: "status", value: "status" },
                    ],
                },
            ],
            execute(opts, ctx) {
                const action = opts.find(o => o.name === "action")?.value as string;

                if (action === "status") {
                    sendBotMessage(ctx.channel.id, {
                        content: dualEnabled
                            ? `✅ DualVoice aktif\n• Korunan DM kanalı: \`${dmChannelId}\``
                            : "❌ DualVoice kapalı",
                    });
                    return;
                }

                if (action === "start") {
                    const chId = SelectedChannelStore?.getVoiceChannelId?.();
                    if (!chId) { sendBotMessage(ctx.channel.id, { content: "❌ Önce bir DM sesine gir." }); return; }
                    const channel = ChannelStore?.getChannel?.(chId);
                    if (!channel || channel.guild_id) { sendBotMessage(ctx.channel.id, { content: "❌ Sadece DM/Grup DM aramaları için çalışır." }); return; }

                    dmChannelId  = chId;
                    dualEnabled  = true;
                    reconnecting = false;
                    FluxDispatcher.subscribe("VOICE_STATE_UPDATE" as any, onVoiceStateUpdate);
                    sendBotMessage(ctx.channel.id, { content: "✅ DualVoice başlatıldı. Şimdi sunucu ses kanalına katıl." });
                    return;
                }

                if (action === "stop") {
                    FluxDispatcher.unsubscribe("VOICE_STATE_UPDATE" as any, onVoiceStateUpdate);
                    dualEnabled = false; dmChannelId = null;
                    sendBotMessage(ctx.channel.id, { content: "✅ DualVoice durduruldu." });
                }
            },
        },
    ],

    stop() {
        FluxDispatcher.unsubscribe("VOICE_STATE_UPDATE" as any, onVoiceStateUpdate);
        dualEnabled = false; dmChannelId = null;
    },
});