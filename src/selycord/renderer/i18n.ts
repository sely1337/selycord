/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Settings } from "./settings";

export type Language = "en" | "tr";

export function getCurrentLang(): Language {
    return (Settings.store as any).language ?? "en";
}

// ─── Translation map ──────────────────────────────────────────────────────────

const translations = {
    en: {
        // Language section
        langSection: "Language",
        langLabel: "Interface Language",
        langDesc: "Choose the language for the Selycord settings panel",

        // Sections
        sDiscordBranch: "Discord Branch",
        sStartup: "System Startup & Performance",
        sUI: "User Interface",
        sBehaviour: "Behaviour",
        sNotifications: "Notifications",
        sRichPresence: "Rich Presence",
        sMisc: "Miscellaneous",
        sDev: "Developer Options",
        sImport: "Import from Equicord / Vencord",

        // Startup & Performance
        hardwareAccel_title: "Hardware Acceleration",
        hardwareAccel_desc: "Enable hardware acceleration",
        videoAccel_title: "Video Hardware Acceleration",
        videoAccel_desc: "Enable hardware video acceleration. This can improve performance of screenshare and video playback, but may cause graphical glitches and infinitely loading streams.",

        // User Interface
        customTitleBar_title: "Discord Titlebar",
        customTitleBar_desc: "Use Discord's custom title bar instead of the native system one. Requires a full restart.",
        staticTitle_title: "Static Title",
        staticTitle_desc: 'Makes the window title "Selycord" instead of changing to the current page',
        enableMenu_title: "Enable Menu Bar",
        enableMenu_desc: "Enables the application menu bar. Press ALT to toggle visibility.",
        enableSplash_title: "Enable Splash Screen",
        enableSplash_desc: "Shows a small splash screen while Selycord is loading. Disabling this option will show the main window earlier while it's still loading.",
        splashTheming_title: "Splash Theming",
        splashTheming_desc: "Adapt the splash window colors to your custom theme",
        splashProgress_title: "Show Progress Bar in Splash",
        splashProgress_desc: "Adds a fancy progress bar to the splash window",

        // Behaviour
        tray_title: "Tray Icon",
        tray_desc: "Add a tray icon for Selycord",
        minimizeToTray_title: "Minimize to Tray",
        minimizeToTray_desc: "Hitting X will make Selycord minimize to the tray instead of closing",
        clickTrayToShowHide_title: "Hide/Show on Tray Click",
        clickTrayToShowHide_desc: "Left clicking tray icon will toggle the Selycord window visibility.",
        disableMinSize_title: "Disable Minimum Window Size",
        disableMinSize_desc: "Allows you to make the window as small as your heart desires",
        disableSmoothScroll_title: "Disable Smooth Scrolling",
        disableSmoothScroll_desc: "Disables smooth scrolling",

        // Notifications
        enableTaskbarFlashing_title: "Enable Taskbar Flashing",
        enableTaskbarFlashing_desc: "Flashes the app in your taskbar when you have new notifications.",

        // Miscellaneous
        middleClickAutoscroll_title: "Middle Click Autoscroll",
        middleClickAutoscroll_desc: "Enables middle-click scrolling (Requires a full restart)",
        openLinksWithElectron_title: "Open Links in App (experimental)",
        openLinksWithElectron_desc: "Opens links in a new Selycord window instead of your web browser",

        // Error boundary
        settingsError: "Failed to render the Selycord Settings tab. If this issue persists, try to right click the Selycord tray icon, then click 'Repair Selycord'. And make sure your Selycord is up to date.",
    },
    tr: {
        // Language section
        langSection: "Dil",
        langLabel: "Arayüz Dili",
        langDesc: "Selycord ayarlar panelinin dilini seçin",

        // Sections
        sDiscordBranch: "Discord Sürümü",
        sStartup: "Sistem Başlangıcı & Performans",
        sUI: "Kullanıcı Arayüzü",
        sBehaviour: "Davranış",
        sNotifications: "Bildirimler",
        sRichPresence: "Zengin Durum",
        sMisc: "Çeşitli",
        sDev: "Geliştirici Seçenekleri",
        sImport: "Equicord / Vencord'dan İçe Aktar",

        // Startup & Performance
        hardwareAccel_title: "Donanım Hızlandırma",
        hardwareAccel_desc: "Donanım hızlandırmayı etkinleştir",
        videoAccel_title: "Video Donanım Hızlandırma",
        videoAccel_desc: "Video donanım hızlandırmayı etkinleştir. Ekran paylaşımı ve video oynatma performansını artırabilir; ancak grafik hatalarına ve sonsuz yüklenen yayınlara yol açabilir.",

        // User Interface
        customTitleBar_title: "Discord Başlık Çubuğu",
        customTitleBar_desc: "Sistem varsayılanı yerine Discord'un özel başlık çubuğunu kullan. Tam yeniden başlatma gerektirir.",
        staticTitle_title: "Sabit Başlık",
        staticTitle_desc: 'Pencere başlığını aktif sayfaya göre değiştirmek yerine her zaman "Selycord" olarak gösterir',
        enableMenu_title: "Menü Çubuğunu Etkinleştir",
        enableMenu_desc: "Uygulama menü çubuğunu etkinleştirir. Görünürlüğü değiştirmek için ALT'a basın.",
        enableSplash_title: "Açılış Ekranını Etkinleştir",
        enableSplash_desc: "Selycord yüklenirken küçük bir açılış ekranı gösterir. Bu seçeneği devre dışı bırakmak, ana pencereyi henüz yüklenirken erken gösterir.",
        splashTheming_title: "Açılış Ekranı Teması",
        splashTheming_desc: "Açılış ekranı renklerini özel temanıza uyarlayın",
        splashProgress_title: "Açılışta İlerleme Çubuğu Göster",
        splashProgress_desc: "Açılış ekranına şık bir ilerleme çubuğu ekler",

        // Behaviour
        tray_title: "Sistem Tepsisi Simgesi",
        tray_desc: "Selycord için sistem tepsisine simge ekle",
        minimizeToTray_title: "Tepsiye Küçült",
        minimizeToTray_desc: "X'e basmak Selycord'u kapatmak yerine sistem tepsisine küçültür",
        clickTrayToShowHide_title: "Tepsi Tıklamasıyla Gizle/Göster",
        clickTrayToShowHide_desc: "Tepsi simgesine sol tıklamak Selycord penceresinin görünürlüğünü değiştirir.",
        disableMinSize_title: "Minimum Pencere Boyutunu Devre Dışı Bırak",
        disableMinSize_desc: "Pencereyi istediğiniz kadar küçültmenize olanak tanır",
        disableSmoothScroll_title: "Yumuşak Kaydırmayı Devre Dışı Bırak",
        disableSmoothScroll_desc: "Yumuşak kaydırmayı devre dışı bırakır",

        // Notifications
        enableTaskbarFlashing_title: "Görev Çubuğu Yanıp Sönmesini Etkinleştir",
        enableTaskbarFlashing_desc: "Yeni bildirimleriniz olduğunda görev çubuğundaki uygulamayı yanıp söndürür.",

        // Miscellaneous
        middleClickAutoscroll_title: "Orta Tık Otomatik Kaydırma",
        middleClickAutoscroll_desc: "Orta tık kaydırmayı etkinleştirir (Tam yeniden başlatma gerektirir)",
        openLinksWithElectron_title: "Bağlantıları Uygulamada Aç (deneysel)",
        openLinksWithElectron_desc: "Bağlantıları web tarayıcısı yerine yeni bir Selycord penceresinde açar",

        // Error boundary
        settingsError: "Selycord Ayarlar sekmesi oluşturulamadı. Sorun devam ederse Selycord tepsi simgesine sağ tıklayıp 'Selycord'u Onar' seçeneğine tıklayın. Selycord'unuzun güncel olduğundan da emin olun.",
    },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey): string {
    const lang = getCurrentLang();
    return (translations[lang] as any)[key] ?? (translations.en as any)[key] ?? key;
}