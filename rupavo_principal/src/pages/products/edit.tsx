import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch } from "antd";

export const ProductEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  const { selectProps: shopSelectProps } = useSelect({
    resource: "shops",
    optionLabel: "name",
    optionValue: "id",
    defaultValue: formProps.initialValues?.shop_id,
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Shop"
          name="shop_id"
          rules={[
            {
              required: true,
              message: "Please select a shop",
            },
          ]}
        >
          <Select {...shopSelectProps} />
        </Form.Item>
        <Form.Item
          label="Product Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter product name",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Slug"
          name="slug"
        >
          <Input placeholder="product-slug" />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="Price"
          name="price"
          rules={[
            {
              required: true,
              message: "Please enter price",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            precision={2}
            formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          />
        </Form.Item>
        <Form.Item
          label="Cost Price"
          name="cost_price"
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            precision={2}
            formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          />
        </Form.Item>
        <Form.Item
          label="Image URL"
          name="image_url"
        >
          <Input placeholder="https://example.com/image.jpg" />
        </Form.Item>
        <Form.Item
          label="Sort Order"
          name="sort_order"
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Active"
          name="is_active"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
