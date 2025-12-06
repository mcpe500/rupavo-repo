import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Switch, Card, Row, Col, InputNumber } from "antd";

export const StorefrontEdit = () => {
    const { formProps, saveButtonProps, query } = useForm({
        resource: "storefront_layouts",
    });

    const record = query?.data?.data;

    // Shop select
    const { selectProps: shopSelectProps } = useSelect({
        resource: "shops",
        optionLabel: "name",
        optionValue: "id",
        defaultValue: record?.shop_id,
    });

    // Color palette options
    const colorPaletteOptions = [
        { label: 'Fresh Green (Sayur/Organik)', value: 'fresh-green' },
        { label: 'Warm Sunset (Makanan/Kuliner)', value: 'warm-sunset' },
        { label: 'Ocean Blue (Seafood/Minuman)', value: 'ocean-blue' },
        { label: 'Elegant Purple (Fashion/Beauty)', value: 'elegant-purple' },
        { label: 'Earthy Brown (Kopi/Craft)', value: 'earthy-brown' },
        { label: 'Modern Dark (Premium/Tech)', value: 'modern-dark' },
        { label: 'Pastel Pink (Florist/Gift)', value: 'pastel-pink' },
        { label: 'Nature Earth (Pertanian/Herbal)', value: 'nature-earth' },
        { label: 'Coffee Dark (Kopi Premium)', value: 'coffee-dark' },
        { label: 'Fresh Market (Grocery)', value: 'fresh-market' },
        { label: 'Sea Side (Seafood/Pantai)', value: 'sea-side' },
        { label: 'Minimal Black (Luxury)', value: 'minimal-black' },
        { label: 'Soft Beige (Homemade/Artisan)', value: 'soft-beige' },
        { label: 'Tropical (Buah/Jus)', value: 'tropical' },
        { label: 'Berry (Dessert/Pastry)', value: 'berry' },
        { label: 'Custom', value: 'custom' },
    ];

    // Hero layout options
    const heroLayoutOptions = [
        { label: 'Centered', value: 'centered' },
        { label: 'Image Left', value: 'image-left' },
        { label: 'Image Right', value: 'image-right' },
        { label: 'Split', value: 'split' },
        { label: 'Stacked', value: 'stacked' },
        { label: 'Story', value: 'story' },
        { label: 'Badge Hero', value: 'badge-hero' },
        { label: 'Product Focus', value: 'product-focus' },
        { label: 'Carousel', value: 'carousel' },
    ];

    // Hero style options
    const heroStyleOptions = [
        { label: 'Minimal', value: 'minimal' },
        { label: 'Bold', value: 'bold' },
        { label: 'Gradient', value: 'gradient' },
        { label: 'Glassmorphism', value: 'glassmorphism' },
        { label: 'Neumorphism', value: 'neumorphism' },
        { label: 'Carded', value: 'carded' },
        { label: 'Outline', value: 'outline' },
        { label: 'Floating', value: 'floating' },
    ];

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Card title="Basic Info" size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Shop" name="shop_id" rules={[{ required: true }]}>
                                <Select {...shopSelectProps} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Version" name="version">
                                <InputNumber disabled style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Active" name="is_active" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title="🎨 Theme" size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Mode" name={["theme", "mode"]}>
                                <Select>
                                    <Select.Option value="light">Light</Select.Option>
                                    <Select.Option value="dark">Dark</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Color Palette" name={["theme", "color_palette"]}>
                                <Select options={colorPaletteOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Tone" name={["theme", "tone"]}>
                                <Select>
                                    <Select.Option value="playful">Playful</Select.Option>
                                    <Select.Option value="serious">Serious</Select.Option>
                                    <Select.Option value="premium">Premium</Select.Option>
                                    <Select.Option value="eco">Eco</Select.Option>
                                    <Select.Option value="family-friendly">Family Friendly</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Primary Color" name={["theme", "primary_color"]}>
                                <Input placeholder="#136F63" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Secondary Color" name={["theme", "secondary_color"]}>
                                <Input placeholder="#FF7A3C" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Accent Color" name={["theme", "accent_color"]}>
                                <Input placeholder="#FCD34D" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Background Color" name={["theme", "background_color"]}>
                                <Input placeholder="#F8FAFC" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Surface Color" name={["theme", "surface_color"]}>
                                <Input placeholder="#FFFFFF" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Text Primary" name={["theme", "text_primary"]}>
                                <Input placeholder="#1F2937" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title="🦸 Hero Section" size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Layout" name={["hero", "layout"]}>
                                <Select options={heroLayoutOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Style" name={["hero", "style"]}>
                                <Select options={heroStyleOptions} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Title" name={["hero", "title"]}>
                        <Input placeholder="Headline utama toko" />
                    </Form.Item>
                    <Form.Item label="Subtitle" name={["hero", "subtitle"]}>
                        <Input.TextArea rows={2} placeholder="Deskripsi singkat" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="CTA Label" name={["hero", "call_to_action_label"]}>
                                <Input placeholder="Lihat Produk" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Badge" name={["hero", "highlight_badge"]}>
                                <Input placeholder="Best Seller" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title="🦶 Footer" size="small">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Style" name={["footer", "style"]}>
                                <Select>
                                    <Select.Option value="minimal">Minimal</Select.Option>
                                    <Select.Option value="centered">Centered</Select.Option>
                                    <Select.Option value="full">Full</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Show Contact" name={["footer", "show_contact"]} valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Show Social" name={["footer", "show_social"]} valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Contact Text" name={["footer", "contact_text"]}>
                        <Input placeholder="WhatsApp: 08123456789" />
                    </Form.Item>
                    <Form.Item label="Location" name={["footer", "location_text"]}>
                        <Input placeholder="Jakarta, Indonesia" />
                    </Form.Item>
                </Card>
            </Form>
        </Edit>
    );
};
