/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./settings.css";

import { classNameFactory } from "@Selycord/types/api/Styles";
import { BaseText, Divider, ErrorBoundary } from "@Selycord/types/components";
import { React } from "@webpack/common";
import { t } from "renderer/i18n";
import { Settings, useSettings } from "renderer/settings";
import { isMac, isWindows } from "renderer/utils";

import { ArRPCSettingsButton } from "./ArRPCSettings";
import { AutoStartToggle } from "./AutoStartToggle";
import { DeveloperOptionsButton } from "./DeveloperOptions";
import { DiscordBranchPicker } from "./DiscordBranchPicker";
import { ImportLegacySettingsButton } from "./ImportLegacySettings";
import { NotificationBadgeToggle } from "./NotificationBadgeToggle";
import { OutdatedVesktopWarning } from "./OutdatedVesktopWarning";
import { Updater } from "./Updater";
import { UserAssetsButton } from "./UserAssets";
import { VesktopSettingsSwitch } from "./VesktopSettingsSwitch";
import { WindowsTransparencyControls } from "./WindowsTransparencyControls";

interface BooleanSetting {
    key: keyof typeof Settings.store;
    titleKey: string;
    descKey: string;
    defaultValue: boolean;
    disabled?(): boolean;
    invisible?(): boolean;
}

export const cl = classNameFactory("vcd-settings-");

export type SettingsComponent = React.ComponentType<{ settings: typeof Settings.store; }>;

// ─── Language Picker ────────────────────────────────────────────────────────

function LanguagePicker({ settings }: { settings: typeof Settings.store; }) {
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    const current = (settings as any).language ?? "en";

    function select(lang: "en" | "tr") {
        (Settings.store as any).language = lang;
        forceUpdate();
    }

    const btnBase: React.CSSProperties = {
        padding: "6px 20px",
        borderRadius: 6,
        border: "1.5px solid var(--brand-experiment, #5865f2)",
        cursor: "pointer",
        fontFamily: "var(--font-primary)",
        fontSize: 14,
        fontWeight: 600,
        transition: "background 0.15s, color 0.15s",
    };
    const btnActive: React.CSSProperties = {
        ...btnBase,
        background: "var(--brand-experiment, #5865f2)",
        color: "#fff",
    };
    const btnInactive: React.CSSProperties = {
        ...btnBase,
        background: "transparent",
        color: "var(--text-normal)",
    };

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <div>
                <div style={{ fontFamily: "var(--font-primary)", fontSize: 14, fontWeight: 600, color: "var(--header-primary)" }}>
                    {t("langLabel")}
                </div>
                <div style={{ fontFamily: "var(--font-primary)", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {t("langDesc")}
                </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                <button style={current === "en" ? btnActive : btnInactive} onClick={() => select("en")}>English</button>
                <button style={current === "tr" ? btnActive : btnInactive} onClick={() => select("tr")}>Türkçe</button>
            </div>
        </div>
    );
}

// ─── Settings definitions (using translation keys) ─────────────────────────

function buildSettingsOptions(): Record<string, Array<BooleanSetting | SettingsComponent>> {
    return {
        [t("sDiscordBranch")]: [DiscordBranchPicker],
        [t("sStartup")]: [
            AutoStartToggle,
            {
                key: "hardwareAcceleration",
                titleKey: t("hardwareAccel_title"),
                descKey: t("hardwareAccel_desc"),
                defaultValue: true
            },
            {
                key: "hardwareVideoAcceleration",
                titleKey: t("videoAccel_title"),
                descKey: t("videoAccel_desc"),
                defaultValue: false,
                disabled: () => Settings.store.hardwareAcceleration === false
            }
        ],
        [t("sUI")]: [
            {
                key: "customTitleBar",
                titleKey: t("customTitleBar_title"),
                descKey: t("customTitleBar_desc"),
                defaultValue: isWindows
            },
            {
                key: "staticTitle",
                titleKey: t("staticTitle_title"),
                descKey: t("staticTitle_desc"),
                defaultValue: false
            },
            {
                key: "enableMenu",
                titleKey: t("enableMenu_title"),
                descKey: t("enableMenu_desc"),
                defaultValue: false,
                disabled: () => Settings.store.customTitleBar ?? isWindows
            },
            {
                key: "enableSplashScreen",
                titleKey: t("enableSplash_title"),
                descKey: t("enableSplash_desc"),
                defaultValue: true
            },
            {
                key: "splashTheming",
                titleKey: t("splashTheming_title"),
                descKey: t("splashTheming_desc"),
                defaultValue: true
            },
            {
                key: "splashProgress",
                titleKey: t("splashProgress_title"),
                descKey: t("splashProgress_desc"),
                defaultValue: false
            },
            WindowsTransparencyControls,
            UserAssetsButton
        ],
        [t("sBehaviour")]: [
            {
                key: "tray",
                titleKey: t("tray_title"),
                descKey: t("tray_desc"),
                defaultValue: true,
                invisible: () => isMac
            },
            {
                key: "minimizeToTray",
                titleKey: t("minimizeToTray_title"),
                descKey: t("minimizeToTray_desc"),
                defaultValue: true,
                invisible: () => isMac,
                disabled: () => Settings.store.tray === false
            },
            {
                key: "clickTrayToShowHide",
                titleKey: t("clickTrayToShowHide_title"),
                descKey: t("clickTrayToShowHide_desc"),
                defaultValue: false
            },
            {
                key: "disableMinSize",
                titleKey: t("disableMinSize_title"),
                descKey: t("disableMinSize_desc"),
                defaultValue: false
            },
            {
                key: "disableSmoothScroll",
                titleKey: t("disableSmoothScroll_title"),
                descKey: t("disableSmoothScroll_desc"),
                defaultValue: false
            }
        ],
        [t("sNotifications")]: [
            NotificationBadgeToggle,
            {
                key: "enableTaskbarFlashing",
                titleKey: t("enableTaskbarFlashing_title"),
                descKey: t("enableTaskbarFlashing_desc"),
                defaultValue: false
            }
        ],
        [t("sRichPresence")]: [ArRPCSettingsButton],
        [t("sMisc")]: [
            {
                key: "middleClickAutoscroll",
                titleKey: t("middleClickAutoscroll_title"),
                descKey: t("middleClickAutoscroll_desc"),
                defaultValue: false
            },
            {
                key: "openLinksWithElectron",
                titleKey: t("openLinksWithElectron_title"),
                descKey: t("openLinksWithElectron_desc"),
                defaultValue: false
            }
        ],
        [t("sDev")]: [DeveloperOptionsButton],
        [t("sImport")]: [ImportLegacySettingsButton]
    };
}

function SettingsSections() {
    const settings = useSettings();
    // Re-build when language changes (useSettings already triggers re-render on any settings change)
    const SettingsOptions = buildSettingsOptions();

    const sections = Object.entries(SettingsOptions).map(([title, items], i, arr) => (
        <div key={title} className={cl("category")}>
            <BaseText size="lg" weight="semibold" tag="h3" className={cl("category-title")}>
                {title}
            </BaseText>

            <div className={cl("category-content")}>
                {items.map((Setting, idx) => {
                    if (typeof Setting === "function") return <Setting key={`Custom-${idx}`} settings={settings} />;

                    const { defaultValue, titleKey, descKey, key, disabled, invisible } = Setting as BooleanSetting;
                    if (invisible?.()) return null;

                    return (
                        <VesktopSettingsSwitch
                            title={titleKey}
                            description={descKey}
                            value={(settings as any)[key] ?? defaultValue}
                            onChange={(v: any) => ((settings as any)[key] = v)}
                            disabled={disabled?.()}
                            key={key}
                        />
                    );
                })}
            </div>

            {i < arr.length - 1 && <Divider className={cl("category-divider")} />}
        </div>
    ));

    return <>{sections}</>;
}

export default ErrorBoundary.wrap(
    function SettingsUI() {
        const settings = useSettings();
        return (
            <section>
                <Updater />
                <OutdatedVesktopWarning />

                {/* Language picker at top */}
                <div className={cl("category")}>
                    <BaseText size="lg" weight="semibold" tag="h3" className={cl("category-title")}>
                        {t("langSection")}
                    </BaseText>
                    <div className={cl("category-content")}>
                        <LanguagePicker settings={settings} />
                    </div>
                    <Divider className={cl("category-divider")} />
                </div>

                <SettingsSections />
            </section>
        );
    },
    {
        message: t("settingsError")
    }
);
