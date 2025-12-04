import React from "react";
import { Typography, Space, theme } from "antd";

const { Title: AntdTitle } = Typography;
const { useToken } = theme;

export const Title: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
    const { token } = useToken();

    return (
        <Space style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "0 12px" }}>
            {!collapsed && (
                <AntdTitle level={3} style={{ margin: 0, color: token.colorTextHeading, whiteSpace: "nowrap" }}>
                    Rupavo
                </AntdTitle>
            )}
            {collapsed && (
                <AntdTitle level={3} style={{ margin: 0, color: token.colorTextHeading }}>
                    R
                </AntdTitle>
            )}
        </Space>
    );
};
