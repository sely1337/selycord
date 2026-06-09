/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./VencordTab.css";

import { isCompactModeEnabled, isStealthModeEnabled, toggleCompactMode, toggleStealthMode } from "@api/HeaderBar";
import { openNotificationLogModal } from "@api/Notifications/notificationLog";
import { plugins } from "@api/PluginManager";
import { useSettings } from "@api/Settings";
import { beginDiscordOAuth, checkOAuthToken, clearToken, getStoredToken, storeToken } from "../../../../api/OAuth2";
import { Button } from "@components/Button";
import { Card } from "@components/Card";
import { Divider } from "@components/Divider";
import { Flex } from "@components/Flex";
import { FormSwitch } from "@components/FormSwitch";
import { Heading } from "@components/Heading";
import { HeartIcon, LogIcon, OwnerCrownIcon, PaintbrushIcon, PlanetIcon, RestartIcon } from "@components/Icons";
import { Notice } from "@components/Notice";
import { Paragraph } from "@components/Paragraph";
import { openPluginModal, SettingsTab, wrapTab } from "@components/settings";
import { QuickAction, QuickActionCard } from "@components/settings/QuickAction";
import { IS_MAC, IS_WINDOWS } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { Margins } from "@utils/margins";
import { identity } from "@utils/misc";
import { openModal } from "@utils/modal";
import { relaunch } from "@utils/native";
import { Avatar, OAuth2AuthorizeModal, React, Select, UserStore } from "@webpack/common";

import { ContributeModal } from "../../../../Selycord/renderer/components/ContributeModal";
import { openNotificationSettingsModal } from "./NotificationSettings";

const cl = classNameFactory("vc-vencord-tab-");

// ─── i18n ────────────────────────────────────────────────────────────────────

const TAB_TRANSLATIONS = {
    en: {
        // Language
        interfaceLanguage: "Interface Language",
        interfaceLanguageDesc: "Choose the display language for Selycord's interface.",

        // Quick Actions
        quickActions: "Quick Actions",
        quickActionsDesc: "Common actions you might want to perform. These shortcuts give you quick access to frequently used features without navigating through menus.",
        notificationLog: "Notification Log",
        editQuickCSS: "Edit QuickCSS",
        relaunchDiscord: "Relaunch Discord",
        contribute: "Contribute",
        devTeam: "DEV Team",
        selycordServer: "Selycord Server",

        // Client Settings
        clientSettings: "Client Settings",
        clientSettingsDesc: "Configure how Selycord behaves and integrates with Discord. These settings affect the Discord client's appearance and behavior.",
        clientSettingsNotice: "You can customize where this settings section appears in Discord's settings menu by configuring the",
        settingsPlugin: "Settings Plugin",

        // Switches
        enableCustomCSS: "Enable Custom CSS",
        enableCustomCSSDesc: "Load custom CSS from the QuickCSS editor. This allows you to customize Discord's appearance with your own styles.",
        enableReactDevtools: "Enable React Developer Tools",
        enableReactDevtoolsDesc: "Enable the React Developer Tools extension for debugging Discord's React components. Useful for plugin development.",
        disableMainFrame: "Disable the Main Window Frame",
        disableMainFrameDesc: "Remove the native window frame for a cleaner look. You can still move the window by dragging the title bar area.",
        disableAllFrames: "Disable All Window Frames",
        disableAllFramesDesc: "Remove the native window frame for a cleaner look. You can still move the window by dragging the title bar area.",
        useWinTitleBar: "Use Windows' native title bar instead of Discord's custom one",
        useWinTitleBarDesc: "Replace Discord's custom title bar with the standard Windows title bar. This may improve compatibility with some window management tools.",
        enableTransparency: "Enable Window Transparency",
        enableTransparencyDesc: "Make the Discord window transparent. A theme that supports transparency is required or this will do nothing.",
        transparencyWarnWin: "This will stop the window from being resizable and prevents you from snapping the window to screen edges.",
        transparencyWarnOther: "This will stop the window from being resizable.",
        disableMinSize: "Disable Minimum Window Size",
        disableMinSizeDesc: "Allow the Discord window to be resized smaller than its default minimum size. Useful for tiling window managers or small screens.",
        ctrlQ: "Register Ctrl+Q as shortcut to close Discord",
        ctrlQDesc: "Add Ctrl+Q as a keyboard shortcut to close Discord. This provides an alternative to Alt+F4 for quickly closing the application.",

        // Sync
        selycordSync: "Selycord Sync",
        selycordSyncEnabledDesc: "Your custom profile is synced. Other Selycord users can see your profile, and you can see theirs.",
        selycordSyncDisabledDesc: "Enable to share your custom profile with other Selycord users and see their profiles.",
        disconnectAccount: "Disconnect account",

        // Vibrancy
        windowVibrancy: "Window Vibrancy",
        windowVibrancyDesc: "Customize the macOS window vibrancy effect. This controls the blur and transparency style of the Discord window. Changes require a restart to take effect.",

        // Notifications
        notifications: "Notifications",
        notificationsDesc: "Configure how Selycord handles notifications. You can customize when and how you receive alerts, or view a history of past notifications.",
        notificationSettings: "Notification Settings",
        viewNotificationLog: "View Notification Log",

        // Compact Mode
        compactMode: "Compact Mode",
        compactModeDesc: "Replaces all Selycord buttons with a single compact toggle icon. Click the icon in the header bar, channel toolbar, or chat bar to restore all buttons.",
        compactEnabled: "✓ Compact Mode Enabled — Click to disable",
        compactDisabled: "Enable Compact Mode",

        // Stealth Mode
        stealthMode: "Stealth Mode",
        stealthModeDesc: "Hides all Selycord visual elements without disabling plugins. Shortcut: Ctrl+Shift+H",
        stealthEnabled: "✓ Stealth Mode Enabled — Click to disable",
        stealthDisabled: "Enable Stealth Mode",
    },
    tr: {
        // Language
        interfaceLanguage: "Arayüz Dili",
        interfaceLanguageDesc: "Selycord arayüzünün görüntüleme dilini seçin.",

        // Quick Actions
        quickActions: "Hızlı İşlemler",
        quickActionsDesc: "Sık gerçekleştirmek isteyebileceğiniz işlemler. Bu kısayollar, menülerde gezinmeden sık kullanılan özelliklere hızlıca erişmenizi sağlar.",
        notificationLog: "Bildirim Geçmişi",
        editQuickCSS: "Hızlı CSS'i Düzenle",
        relaunchDiscord: "Discord'u Yeniden Başlat",
        contribute: "Katkıda Bulun",
        devTeam: "Geliştirici Ekibi",
        selycordServer: "Selycord Sunucusu",

        // Client Settings
        clientSettings: "İstemci Ayarları",
        clientSettingsDesc: "Selycord'un Discord ile nasıl davranacağını ve entegre olacağını yapılandırın. Bu ayarlar Discord istemcisinin görünümünü ve davranışını etkiler.",
        clientSettingsNotice: "Bu ayarlar bölümünün Discord ayarlar menüsünde nerede görüneceğini özelleştirmek için",
        settingsPlugin: "Ayarlar Eklentisi",

        // Switches
        enableCustomCSS: "Özel CSS'i Etkinleştir",
        enableCustomCSSDesc: "QuickCSS düzenleyicisinden özel CSS yükler. Discord'un görünümünü kendi stillerinizle özelleştirmenize olanak tanır.",
        enableReactDevtools: "React Geliştirici Araçlarını Etkinleştir",
        enableReactDevtoolsDesc: "Discord'un React bileşenlerini hata ayıklamak için React Geliştirici Araçları uzantısını etkinleştirir. Eklenti geliştirme için kullanışlıdır.",
        disableMainFrame: "Ana Pencere Çerçevesini Devre Dışı Bırak",
        disableMainFrameDesc: "Daha temiz bir görünüm için yerel pencere çerçevesini kaldırır. Başlık çubuğu alanını sürükleyerek pencereyi taşıyabilirsiniz.",
        disableAllFrames: "Tüm Pencere Çerçevelerini Devre Dışı Bırak",
        disableAllFramesDesc: "Daha temiz bir görünüm için yerel pencere çerçevesini kaldırır. Başlık çubuğu alanını sürükleyerek pencereyi taşıyabilirsiniz.",
        useWinTitleBar: "Discord'un özel başlık çubuğu yerine Windows'un yerel başlık çubuğunu kullan",
        useWinTitleBarDesc: "Discord'un özel başlık çubuğunu standart Windows başlık çubuğuyla değiştirir. Bazı pencere yönetimi araçlarıyla uyumluluğu artırabilir.",
        enableTransparency: "Pencere Saydamlığını Etkinleştir",
        enableTransparencyDesc: "Discord penceresini saydam yapar. Saydamlığı destekleyen bir tema gereklidir; aksi hâlde bu ayarın etkisi olmaz.",
        transparencyWarnWin: "Bu, pencerenin yeniden boyutlandırılmasını engelleyecek ve pencerenin ekran kenarlarına yapıştırılmasını önleyecektir.",
        transparencyWarnOther: "Bu, pencerenin yeniden boyutlandırılmasını engelleyecektir.",
        disableMinSize: "Minimum Pencere Boyutunu Devre Dışı Bırak",
        disableMinSizeDesc: "Discord penceresinin varsayılan minimum boyutundan daha küçük boyutlandırılmasına izin verir. Döşeme pencere yöneticileri veya küçük ekranlar için kullanışlıdır.",
        ctrlQ: "Ctrl+Q'yu Discord'u kapatmak için kısayol olarak kaydet",
        ctrlQDesc: "Discord'u kapatmak için Ctrl+Q klavye kısayolunu ekler. Alt+F4'e alternatif olarak uygulamayı hızlıca kapatmanızı sağlar.",

        // Sync
        selycordSync: "Selycord Senkronizasyonu",
        selycordSyncEnabledDesc: "Özel profiliniz senkronize edildi. Diğer Selycord kullanıcıları profilinizi görebilir, siz de onlarınkini görebilirsiniz.",
        selycordSyncDisabledDesc: "Özel profilinizi diğer Selycord kullanıcılarıyla paylaşmak ve onların profillerini görmek için etkinleştirin.",
        disconnectAccount: "Hesabı bağlantısını kes",

        // Vibrancy
        windowVibrancy: "Pencere Titreşimi",
        windowVibrancyDesc: "macOS pencere titreşim efektini özelleştirin. Discord penceresinin bulanıklık ve saydamlık stilini kontrol eder. Değişiklikler yeniden başlatma gerektirir.",

        // Notifications
        notifications: "Bildirimler",
        notificationsDesc: "Selycord'un bildirimleri nasıl işleyeceğini yapılandırın. Uyarıları ne zaman ve nasıl alacağınızı özelleştirebilir veya geçmiş bildirimleri görüntüleyebilirsiniz.",
        notificationSettings: "Bildirim Ayarları",
        viewNotificationLog: "Bildirim Geçmişini Görüntüle",

        // Compact Mode
        compactMode: "Kompakt Mod",
        compactModeDesc: "Tüm Selycord düğmelerini tek bir kompakt geçiş simgesiyle değiştirir. Tüm düğmeleri geri yüklemek için üst çubuk, kanal araç çubuğu veya sohbet çubuğundaki simgeye tıklayın.",
        compactEnabled: "✓ Kompakt Mod Etkin — Devre dışı bırakmak için tıkla",
        compactDisabled: "Kompakt Modu Etkinleştir",

        // Stealth Mode
        stealthMode: "Gizli Mod",
        stealthModeDesc: "Eklentileri devre dışı bırakmadan tüm Selycord görsel öğelerini gizler. Kısayol: Ctrl+Shift+H",
        stealthEnabled: "✓ Gizli Mod Etkin — Devre dışı bırakmak için tıkla",
        stealthDisabled: "Gizli Modu Etkinleştir",
    },
} as const;

type TKey = keyof typeof TAB_TRANSLATIONS.en;
type Lang = "en" | "tr";

function useT() {
    const settings = useSettings(["language"]);
    const lang: Lang = (settings.language ?? "en") as Lang;
    return function t(key: TKey): string {
        return (TAB_TRANSLATIONS[lang] as any)[key] ?? TAB_TRANSLATIONS.en[key];
    };
}

// ─── Components ──────────────────────────────────────────────────────────────

const DEV_TEAM_IDS = [
    { id: "1086802921984893038", role: "Owner" },
    { id: "171356978310938624", role: "Co-Owner" }
];

function useDiscordUser(userId: string) {
    const [user, setUser] = React.useState<{ name: string; pfp: string; } | null>(null);
    React.useEffect(() => {
        const cached = UserStore?.getUser(userId);
        if (cached) {
            setUser({
                name: cached.globalName ?? cached.username,
                pfp: cached.avatar
                    ? `https://cdn.discordapp.com/avatars/${userId}/${cached.avatar}.webp?size=128`
                    : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) >> 22n) % 6}.png`
            });
            return;
        }
        fetch(`https://discord.com/api/v9/users/${userId}`, {
            headers: { Authorization: (window as any).token ?? "" }
        })
            .then(r => r.json())
            .then(u => setUser({
                name: u.global_name ?? u.username ?? userId,
                pfp: u.avatar
                    ? `https://cdn.discordapp.com/avatars/${userId}/${u.avatar}.webp?size=128`
                    : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) >> 22n) % 6}.png`
            }))
            .catch(() => setUser({ name: userId, pfp: `https://cdn.discordapp.com/embed/avatars/0.png` }));
    }, [userId]);
    return user;
}

function DevCard({ id, role }: { id: string; role: string; }) {
    const user = useDiscordUser(id);
    return (
        <Card variant="primary" outline style={{ padding: "10px" }}>
            <Flex align={Flex.Align.CENTER} gap="10px">
                <Avatar
                    src={user?.pfp ?? `https://cdn.discordapp.com/embed/avatars/0.png`}
                    size="SIZE_48"
                />
                <Flex direction={Flex.Direction.VERTICAL} style={{ flex: 1, gap: "0px" }}>
                    <Heading tag="h3" style={{ marginBottom: "-2px" }}>{user?.name ?? "..."}</Heading>
                    <Heading tag="h4" style={{ opacity: 0.6 }}>{role}</Heading>
                </Flex>
            </Flex>
        </Card>
    );
}

function DevTeamSection() {
    const t = useT();
    const [showDevs, setShowDevs] = React.useState(false);

    return (
        <>
            <QuickActionCard>
                <QuickAction
                    Icon={LogIcon}
                    text={t("notificationLog")}
                    action={openNotificationLogModal}
                />
                <QuickAction
                    Icon={PaintbrushIcon}
                    text={t("editQuickCSS")}
                    action={() => VencordNative.quickCss.openEditor()}
                />
                {!IS_WEB && (
                    <QuickAction
                        Icon={RestartIcon}
                        text={t("relaunchDiscord")}
                        action={relaunch}
                    />
                )}
                <QuickAction
                    Icon={HeartIcon}
                    text={t("contribute")}
                    action={() => openModal(props => <ContributeModal {...props} />)}
                />
                <QuickAction
                    Icon={OwnerCrownIcon}
                    text={t("devTeam")}
                    action={() => setShowDevs(!showDevs)}
                />
                <QuickAction
                    Icon={PlanetIcon}
                    text={t("selycordServer")}
                    action={() => window.open("https://discord.gg/Selycord", "_blank")}
                />
            </QuickActionCard>

            {showDevs && (
                <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", animation: "slideIn 0.3s ease-out" }}>
                    <style>{`
                        @keyframes slideIn {
                            from { opacity: 0; transform: translateY(-10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                    {DEV_TEAM_IDS.map(dev => (
                        <DevCard key={dev.id} id={dev.id} role={dev.role} />
                    ))}
                </div>
            )}
        </>
    );
}

type KeysOfType<Object, Type> = {
    [K in keyof Object]: Object[K] extends Type ? K : never;
}[keyof Object];

function useCompactActive() {
    const [active, setActive] = React.useState(isCompactModeEnabled);
    React.useEffect(() => {
        const handler = () => setActive(isCompactModeEnabled());
        window.addEventListener("Selycord-compact-change", handler);
        return () => window.removeEventListener("Selycord-compact-change", handler);
    }, []);
    return active;
}

function useStealthActive() {
    const [active, setActive] = React.useState(isStealthModeEnabled);
    React.useEffect(() => {
        const handler = () => setActive(isStealthModeEnabled());
        window.addEventListener("Selycord-stealth-change", handler);
        return () => window.removeEventListener("Selycord-stealth-change", handler);
    }, []);
    return active;
}

function CustomProfileSyncToggle() {
    const t = useT();
    const settings = useSettings();
    const [token, setToken] = React.useState<string | null>(null);
    const [checking, setChecking] = React.useState(true);
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        getStoredToken().then(async tok => {
            if (tok) {
                const check = await checkOAuthToken(tok);
                if (check?.valid) {
                    setToken(tok);
                    settings.syncOwnCustomProfile = true;
                    settings.seeAllCustomProfile = true;
                } else {
                    await clearToken();
                    settings.syncOwnCustomProfile = false;
                    settings.seeAllCustomProfile = false;
                }
            } else {
                settings.syncOwnCustomProfile = false;
                settings.seeAllCustomProfile = false;
            }
            setChecking(false);
        });
    }, []);

    const isEnabled = !!token;

    async function handleToggle(on: boolean) {
        if (busy) return;
        if (on) {
            setBusy(true);
            let oauthData: { url: string; redirectUri: string; scopes: string[]; clientId?: string; } | null = null;
            try {
                oauthData = await beginDiscordOAuth();
            } catch (e) {
                console.error("[CustomProfileSync] Failed to fetch OAuth config:", e);
                setBusy(false);
                return;
            }
            setBusy(false);

            let clientId = oauthData.clientId;
            if (!clientId) {
                try {
                    clientId = new URL(oauthData.url).searchParams.get("client_id") ?? undefined;
                } catch { }
            }
            if (!clientId) return;

            openModal(oauthProps => <OAuth2AuthorizeModal
                {...oauthProps}
                scopes={oauthData!.scopes}
                responseType="code"
                redirectUri={oauthData!.redirectUri}
                permissions={0n}
                clientId={clientId!}
                cancelCompletesFlow={false}
                callback={async ({ location }: any) => {
                    if (!location) return;
                    try {
                        const res = await fetch(location, { headers: { Accept: "application/json" } });
                        const { token: newToken } = await res.json();
                        if (newToken) {
                            await storeToken(newToken);
                            setToken(newToken);
                            settings.syncOwnCustomProfile = true;
                            settings.seeAllCustomProfile = true;
                        }
                    } catch (e) {
                        console.error("[CustomProfileSync] OAuth callback failed:", e);
                    }
                }}
            />);
        } else {
            setBusy(true);
            await clearToken();
            setToken(null);
            settings.syncOwnCustomProfile = false;
            settings.seeAllCustomProfile = false;
            setBusy(false);
        }
    }

    if (checking) return null;

    return (
        <div style={{ marginBottom: 16 }}>
            <FormSwitch
                value={isEnabled}
                onChange={handleToggle}
                title={t("selycordSync")}
                description={isEnabled ? t("selycordSyncEnabledDesc") : t("selycordSyncDisabledDesc")}
                disabled={busy}
            />

            {isEnabled && (
                <div style={{ marginTop: 4 }}>
                    <a role="button" onClick={async () => {
                        await clearToken();
                        setToken(null);
                        settings.syncOwnCustomProfile = false;
                        settings.seeAllCustomProfile = false;
                    }} style={{ fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
                        {t("disconnectAccount")}
                    </a>
                </div>
            )}
        </div>
    );
}

function LanguagePicker() {
    const settings = useSettings(["language"]);
    const current = settings.language ?? "en";

    function select(lang: "en" | "tr") {
        settings.language = lang;
    }

    const btnBase: React.CSSProperties = {
        padding: "6px 18px",
        borderRadius: 6,
        border: "1px solid var(--background-modifier-accent)",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 14,
        transition: "background 0.15s, color 0.15s",
    };
    const activeStyle: React.CSSProperties = {
        ...btnBase,
        background: "var(--brand-experiment)",
        color: "#fff",
        borderColor: "var(--brand-experiment)",
    };
    const inactiveStyle: React.CSSProperties = {
        ...btnBase,
        background: "var(--background-secondary)",
        color: "var(--text-normal)",
    };

    return (
        <div style={{ display: "flex", gap: 10 }}>
            <button style={current === "en" ? activeStyle : inactiveStyle} onClick={() => select("en")}>
                🇬🇧 English
            </button>
            <button style={current === "tr" ? activeStyle : inactiveStyle} onClick={() => select("tr")}>
                🇹🇷 Türkçe
            </button>
        </div>
    );
}

function EquicordSettings() {
    const t = useT();
    const settings = useSettings();
    const stealthActive = useStealthActive();
    const compactActive = useCompactActive();

    const needsVibrancySettings = IS_DISCORD_DESKTOP && IS_MAC;

    const Switches: Array<false | {
        key: KeysOfType<typeof settings, boolean>;
        title: string;
        description?: string;
        restartRequired?: boolean;
        warning: { enabled: boolean; message?: string; };
    }>
        = [
            {
                key: "useQuickCss",
                title: t("enableCustomCSS"),
                description: t("enableCustomCSSDesc"),
                restartRequired: true,
                warning: { enabled: false },
            },
            !IS_WEB && {
                key: "enableReactDevtools",
                title: t("enableReactDevtools"),
                description: t("enableReactDevtoolsDesc"),
                restartRequired: true,
                warning: { enabled: false },
            },
            (!IS_WEB && !IS_DISCORD_DESKTOP || !IS_WINDOWS) && {
                key: "mainWindowFrameless",
                title: t("disableMainFrame"),
                description: t("disableMainFrameDesc"),
                restartRequired: true,
                warning: { enabled: false },
            },
            !IS_WEB &&
            (!IS_DISCORD_DESKTOP || !IS_WINDOWS
                ? {
                    key: "frameless",
                    title: t("disableAllFrames"),
                    description: t("disableAllFramesDesc"),
                    restartRequired: true,
                    warning: { enabled: false },
                }
                : {
                    key: "winNativeTitleBar",
                    title: t("useWinTitleBar"),
                    description: t("useWinTitleBarDesc"),
                    restartRequired: true,
                    warning: { enabled: false },
                }
            ),
            !IS_WEB && {
                key: "transparent",
                title: t("enableTransparency"),
                description: t("enableTransparencyDesc"),
                restartRequired: true,
                warning: {
                    enabled: true,
                    message: IS_WINDOWS ? t("transparencyWarnWin") : t("transparencyWarnOther"),
                },
            },
            IS_DISCORD_DESKTOP && {
                key: "disableMinSize",
                title: t("disableMinSize"),
                description: t("disableMinSizeDesc"),
                restartRequired: true,
                warning: { enabled: false },
            },
            !IS_WEB &&
            IS_WINDOWS && {
                key: "winCtrlQ",
                title: t("ctrlQ"),
                description: t("ctrlQDesc"),
                restartRequired: true,
                warning: { enabled: false },
            },
        ];

    return (
        <SettingsTab>

            {!stealthActive && (<>

                <Divider className={Margins.top20} />

                <Heading className={Margins.top16}>{t("quickActions")}</Heading>
                <Paragraph className={Margins.bottom16}>
                    {t("quickActionsDesc")}
                </Paragraph>

                <DevTeamSection />

                <Divider className={Margins.top20} />

                <Heading className={Margins.top20}>{t("clientSettings")}</Heading>
                <Paragraph className={Margins.bottom16}>
                    {t("clientSettingsDesc")}
                </Paragraph>
                <Notice.Info className={Margins.bottom20} style={{ width: "100%" }}>
                    {t("clientSettingsNotice")}{" "}
                    <a
                        role="button"
                        onClick={() => openPluginModal(plugins.Settings)}
                        style={{ cursor: "pointer", color: "var(--text-link)" }}
                    >
                        {t("settingsPlugin")}
                    </a>.
                </Notice.Info>

                <CustomProfileSyncToggle />

                {Switches.filter((s): s is Exclude<typeof s, false> => !!s).map(
                    s => (
                        <FormSwitch
                            key={s.key}
                            value={settings[s.key]}
                            onChange={v => (settings[s.key] = v)}
                            title={s.title}
                            description={
                                s.warning.enabled ? (
                                    <>
                                        {s.description}
                                        <Notice.Warning className={Margins.top8} style={{ width: "100%" }}>
                                            {s.warning.message}
                                        </Notice.Warning>
                                    </>
                                ) : (
                                    s.description
                                )
                            }
                            hideBorder
                        />
                    ),
                )}

                {needsVibrancySettings && (
                    <>
                        <Divider className={Margins.top20} />

                        <Heading className={Margins.top20}>{t("windowVibrancy")}</Heading>
                        <Paragraph className={Margins.bottom16}>
                            {t("windowVibrancyDesc")}
                        </Paragraph>
                        <Select
                            className={Margins.bottom20}
                            placeholder={t("windowVibrancy")}
                            options={[
                                { label: "No vibrancy", value: undefined },
                                { label: "Under Page (window tinting)", value: "under-page" },
                                { label: "Content", value: "content" },
                                { label: "Window", value: "window" },
                                { label: "Selection", value: "selection" },
                                { label: "Titlebar", value: "titlebar" },
                                { label: "Header", value: "header" },
                                { label: "Sidebar", value: "sidebar" },
                                { label: "Tooltip", value: "tooltip" },
                                { label: "Menu", value: "menu" },
                                { label: "Popover", value: "popover" },
                                { label: "Fullscreen UI (transparent but slightly muted)", value: "fullscreen-ui" },
                                { label: "HUD (Most transparent)", value: "hud" },
                            ]}
                            select={v => (settings.macosVibrancyStyle = v)}
                            isSelected={v => settings.macosVibrancyStyle === v}
                            serialize={identity}
                        />
                    </>
                )}

                <Divider className={Margins.top20} />

                <Heading className={Margins.top20}>{t("notifications")}</Heading>
                <Paragraph className={Margins.bottom16}>
                    {t("notificationsDesc")}
                </Paragraph>

                <Flex gap="16px">
                    <Button onClick={openNotificationSettingsModal}>
                        {t("notificationSettings")}
                    </Button>
                    <Button variant="secondary" onClick={openNotificationLogModal}>
                        {t("viewNotificationLog")}
                    </Button>
                </Flex>

            </>)}

            <Divider className={Margins.top20} />

            <Heading className={Margins.top20}>{t("interfaceLanguage")}</Heading>
            <Paragraph className={Margins.bottom16}>
                {t("interfaceLanguageDesc")}
            </Paragraph>
            <LanguagePicker />

            <Divider className={Margins.top20} />

            <Heading className={Margins.top20}>{t("compactMode")}</Heading>
            <Paragraph className={Margins.bottom16}>
                {t("compactModeDesc")}
            </Paragraph>
            <Button
                onClick={toggleCompactMode}
                variant={compactActive ? "dangerPrimary" : "primary"}
            >
                {compactActive ? t("compactEnabled") : t("compactDisabled")}
            </Button>

            <Divider className={Margins.top20} />

            <Heading className={Margins.top20}>{t("stealthMode")}</Heading>
            <Paragraph className={Margins.bottom16}>
                {t("stealthModeDesc")}
            </Paragraph>
            <Button
                onClick={toggleStealthMode}
                variant={stealthActive ? "dangerPrimary" : "primary"}
            >
                {stealthActive ? t("stealthEnabled") : t("stealthDisabled")}
            </Button>

        </SettingsTab>
    );
}

export default wrapTab(EquicordSettings, "Selycord Settings");
