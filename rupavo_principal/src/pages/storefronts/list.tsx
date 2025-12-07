import {
    DateField,
    EditButton,
    List,
    ShowButton,
    TagField,
    useTable,
} from "@refinedev/antd";
import { type BaseRecord, useMany } from "@refinedev/core";
import { Space, Table, Tooltip, Button, Typography, Tag } from "antd";
import { EyeOutlined, LinkOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const StorefrontList = () => {
    const { tableProps } = useTable({
        syncWithLocation: true,
        resource: "storefront_layouts",
        sorters: {
            initial: [{ field: "updated_at", order: "desc" }],
        },
    });

    // Get unique shop IDs from the data
    const shopIds = tableProps?.dataSource?.map((item: any) => item.shop_id).filter(Boolean) || [];

    // Fetch shops for displaying names
    const { result: shopsResult } = useMany({
        resource: "shops",
        ids: shopIds,
        queryOptions: {
            enabled: shopIds.length > 0,
        },
    });
    const shopsData = shopsResult;

    const getShopName = (shopId: string) => {
        const shop = shopsData?.data?.find((s: any) => s.id === shopId);
        return shop?.name || shopId;
    };

    const getShopSlug = (shopId: string) => {
        const shop = shopsData?.data?.find((s: any) => s.id === shopId);
        return shop?.slug || null;
    };

    // Render color palette preview
    const renderColorPalette = (theme: any) => {
        if (!theme) return "-";
        return (
            <Space>
                <Tooltip title={`Primary: ${theme.primary_color}`}>
                    <div
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            backgroundColor: theme.primary_color,
                            border: '1px solid #ddd'
                        }}
                    />
                </Tooltip>
                <Tooltip title={`Secondary: ${theme.secondary_color}`}>
                    <div
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            backgroundColor: theme.secondary_color,
                            border: '1px solid #ddd'
                        }}
                    />
                </Tooltip>
                {theme.accent_color && (
                    <Tooltip title={`Accent: ${theme.accent_color}`}>
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                backgroundColor: theme.accent_color,
                                border: '1px solid #ddd'
                            }}
                        />
                    </Tooltip>
                )}
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {theme.color_palette || theme.mode || 'custom'}
                </Text>
            </Space>
        );
    };

    // Count sections
    const countSections = (layout: any) => {
        if (!layout?.sections) return 0;
        return Array.isArray(layout.sections) ? layout.sections.length : 0;
    };

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="shop_id"
                    title="Shop"
                    render={(value: string) => (
                        <Space direction="vertical" size={0}>
                            <Text strong>{getShopName(value)}</Text>
                            {getShopSlug(value) && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    /{getShopSlug(value)}
                                </Text>
                            )}
                        </Space>
                    )}
                />
                <Table.Column
                    dataIndex="theme"
                    title="Theme"
                    render={(value: any) => renderColorPalette(value)}
                />
                <Table.Column
                    dataIndex="layout"
                    title="Sections"
                    render={(value: any) => (
                        <Tag color="blue">{countSections(value)} sections</Tag>
                    )}
                />
                <Table.Column
                    dataIndex={["layout", "hero", "layout"]}
                    title="Hero Layout"
                    render={(value: string) => value ? <Tag>{value}</Tag> : "-"}
                />
                <Table.Column
                    dataIndex="version"
                    title="Version"
                    render={(value: number) => <Tag color="purple">v{value || 1}</Tag>}
                />
                <Table.Column
                    dataIndex="is_active"
                    title="Status"
                    render={(value: boolean) => (
                        <TagField color={value ? "green" : "default"} value={value ? "Active" : "Inactive"} />
                    )}
                />
                <Table.Column
                    dataIndex="updated_at"
                    title="Updated"
                    render={(value: any) => <DateField value={value} format="DD MMM YYYY, HH:mm" />}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => {
                        const slug = getShopSlug(record.shop_id as string);
                        return (
                            <Space>
                                <ShowButton hideText size="small" recordItemId={record.id} />
                                <EditButton hideText size="small" recordItemId={record.id} />
                                {slug && (
                                    <Tooltip title="Preview Storefront">
                                        <Button
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={() => window.open(`${import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000'}/${slug}`, '_blank')}
                                        />
                                    </Tooltip>
                                )}
                            </Space>
                        );
                    }}
                />
            </Table>
        </List>
    );
};
