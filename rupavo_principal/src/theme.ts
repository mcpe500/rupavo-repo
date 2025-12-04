import type { ThemeConfig } from "antd";

/**
 * Rupavo Design System - Ant Design Theme Configuration
 * 
 * Light Primary: #136F63 (teal)
 * Light Secondary: #FF7A3C (orange)
 * Dark Primary: #3BF5C0 (neon mint)
 * Dark Secondary: #FFB547 (gold)
 */

export const lightTheme: ThemeConfig = {
    token: {
        // Primary color - Teal
        colorPrimary: "#136F63",
        colorPrimaryBg: "#e6f4f2",
        colorPrimaryBgHover: "#cce9e6",
        colorPrimaryBorder: "#8dc4bd",
        colorPrimaryBorderHover: "#5aada3",
        colorPrimaryHover: "#1a8f80",
        colorPrimaryActive: "#0f5a51",
        colorPrimaryTextHover: "#1a8f80",
        colorPrimaryText: "#136F63",
        colorPrimaryTextActive: "#0f5a51",

        // Link color
        colorLink: "#136F63",
        colorLinkHover: "#1a8f80",
        colorLinkActive: "#0f5a51",

        // Success (using secondary orange for highlights)
        colorSuccess: "#136F63",
        colorWarning: "#FF7A3C",
        colorError: "#dc2626",
        colorInfo: "#136F63",

        // Background
        colorBgContainer: "#ffffff",
        colorBgLayout: "#f5f7f7",

        // Border radius
        borderRadius: 8,
        borderRadiusLG: 12,
        borderRadiusSM: 6,

        // Font
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    components: {
        Button: {
            primaryColor: "#ffffff",
            colorPrimary: "#136F63",
            algorithm: true,
        },
        Menu: {
            itemSelectedBg: "#e6f4f2",
            itemSelectedColor: "#136F63",
        },
        Card: {
            colorBorderSecondary: "#e5e7eb",
        },
    },
};

export const darkTheme: ThemeConfig = {
    token: {
        // Primary color - Neon Mint
        colorPrimary: "#3BF5C0",
        colorPrimaryBg: "#0a1f1a",
        colorPrimaryBgHover: "#0f2e26",
        colorPrimaryBorder: "#1d5c4d",
        colorPrimaryBorderHover: "#2a8a73",
        colorPrimaryHover: "#5ff7ce",
        colorPrimaryActive: "#2ed4a5",
        colorPrimaryTextHover: "#5ff7ce",
        colorPrimaryText: "#3BF5C0",
        colorPrimaryTextActive: "#2ed4a5",

        // Link color
        colorLink: "#3BF5C0",
        colorLinkHover: "#5ff7ce",
        colorLinkActive: "#2ed4a5",

        // Status colors
        colorSuccess: "#3BF5C0",
        colorWarning: "#FFB547",
        colorError: "#ef4444",
        colorInfo: "#3BF5C0",

        // Background - Deep blue/black
        colorBgContainer: "#0f1629",
        colorBgLayout: "#050816",
        colorBgElevated: "#1a2640",

        // Text
        colorText: "#f8fafc",
        colorTextSecondary: "#94a3b8",

        // Border radius
        borderRadius: 8,
        borderRadiusLG: 12,
        borderRadiusSM: 6,

        // Font
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    components: {
        Button: {
            primaryColor: "#050816",
            colorPrimary: "#3BF5C0",
            algorithm: true,
        },
        Menu: {
            itemSelectedBg: "#0a1f1a",
            itemSelectedColor: "#3BF5C0",
            darkItemBg: "#050816",
            darkItemColor: "#f8fafc",
            darkItemSelectedBg: "#0a1f1a",
            darkItemSelectedColor: "#3BF5C0",
        },
        Card: {
            colorBorderSecondary: "#1e293b",
        },
        Layout: {
            siderBg: "#050816",
            headerBg: "#0f1629",
        },
    },
};

// Default export for easy import
export default {
    light: lightTheme,
    dark: darkTheme,
};
