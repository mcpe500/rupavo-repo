import {
    DateField,
    Show,
    TagField,
} from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography, Card, Descriptions, Space, Tag, Row, Col, Button, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export const StorefrontShow = () => {
    const { query } = useShow({ resource: "storefront_layouts" });
    const { data, isLoading } = query;
    const record = data?.data;

    // Fetch shop details
    const { query: shopQuery } = useOne({
        resource: "shops",
        id: record?.shop_id,
        queryOptions: {
            enabled: !!record?.shop_id,
        },
    });
    const shop = shopQuery?.data?.data;

    // Render color swatch
    const ColorSwatch = ({ color, label }: { color: string; label: string }) => (
        <Tooltip title={color}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: color,
                        border: '1px solid #ddd'
                    }}
                />
                <Text type="secondary">{label}</Text>
            </div>
        </Tooltip>
    );

    // Render section type badge
    const SectionBadge = ({ type }: { type: string }) => {
        const colors: Record<string, string> = {
            product_grid: 'blue',
            product_carousel: 'cyan',
            highlight_strip: 'green',
            highlight_icons: 'lime',
            testimonial_carousel: 'gold',
            banner_promo: 'orange',
            banner_countdown: 'red',
            about_us: 'purple',
            faq_accordion: 'magenta',
            whatsapp_float: 'green',
            cta_block: 'volcano',
            social_proof: 'geekblue',
        };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
    };

    const previewUrl = shop?.slug
        ? `${import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000'}/${shop.slug}`
        : null;

    return (
        <Show isLoading={isLoading}>
            {/* Shop Info */}
            <Card size="small" style={{ marginBottom: 16 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space direction="vertical" size={0}>
                            <Title level={4} style={{ margin: 0 }}>{shop?.name || 'Loading...'}</Title>
                            <Text type="secondary">/{shop?.slug}</Text>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <TagField
                                color={record?.is_active ? "green" : "default"}
                                value={record?.is_active ? "Active" : "Inactive"}
                            />
                            <Tag color="purple">Version {record?.version || 1}</Tag>
                            {previewUrl && (
                                <Button
                                    type="primary"
                                    icon={<EyeOutlined />}
                                    onClick={() => window.open(previewUrl, '_blank')}
                                >
                                    Preview
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Theme */}
            <Card title="🎨 Theme" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Mode">
                                <Tag>{record?.theme?.mode || 'light'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Palette">
                                <Tag color="blue">{record?.theme?.color_palette || 'custom'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tone">
                                <Tag>{record?.theme?.tone || '-'}</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                    <Col span={12}>
                        <Space direction="vertical" size={8}>
                            <Title level={5} style={{ margin: 0 }}>Colors</Title>
                            {record?.theme?.primary_color && (
                                <ColorSwatch color={record.theme.primary_color} label="Primary" />
                            )}
                            {record?.theme?.secondary_color && (
                                <ColorSwatch color={record.theme.secondary_color} label="Secondary" />
                            )}
                            {record?.theme?.accent_color && (
                                <ColorSwatch color={record.theme.accent_color} label="Accent" />
                            )}
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Hero */}
            <Card title="🦸 Hero Section" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                    <Descriptions.Item label="Layout">
                        <Tag color="blue">{record?.hero?.layout || '-'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Style">
                        <Tag>{record?.hero?.style || '-'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Title" span={2}>
                        <Text strong>{record?.hero?.title || '-'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Subtitle" span={2}>
                        <Text>{record?.hero?.subtitle || '-'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="CTA">
                        <Tag color="green">{record?.hero?.call_to_action_label || '-'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Badge">
                        {record?.hero?.highlight_badge || '-'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Sections */}
            <Card title={`📦 Sections (${record?.sections?.length || 0})`} size="small" style={{ marginBottom: 16 }}>
                <Space wrap>
                    {record?.sections?.map((section: { type: string; title?: string }, index: number) => (
                        <Card
                            key={index}
                            size="small"
                            style={{ width: 200 }}
                            title={<SectionBadge type={section.type} />}
                        >
                            <Text ellipsis style={{ display: 'block' }}>
                                {section.title || section.type}
                            </Text>
                        </Card>
                    ))}
                </Space>
                {(!record?.sections || record.sections.length === 0) && (
                    <Text type="secondary">No sections defined</Text>
                )}
            </Card>

            {/* Footer */}
            <Card title="🦶 Footer" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={3} size="small">
                    <Descriptions.Item label="Style">
                        <Tag>{record?.footer?.style || 'default'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Contact">
                        <TagField
                            color={record?.footer?.show_contact ? "green" : "red"}
                            value={record?.footer?.show_contact ? "Yes" : "No"}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="Social">
                        <TagField
                            color={record?.footer?.show_social ? "green" : "red"}
                            value={record?.footer?.show_social ? "Yes" : "No"}
                        />
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Meta */}
            <Card title="ℹ️ Metadata" size="small">
                <Descriptions column={2} size="small">
                    <Descriptions.Item label="ID">
                        <Text copyable code>{record?.id}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Shop ID">
                        <Text copyable code>{record?.shop_id}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created">
                        <DateField value={record?.created_at} format="DD MMM YYYY, HH:mm" />
                    </Descriptions.Item>
                    <Descriptions.Item label="Updated">
                        <DateField value={record?.updated_at} format="DD MMM YYYY, HH:mm" />
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </Show>
    );
};
