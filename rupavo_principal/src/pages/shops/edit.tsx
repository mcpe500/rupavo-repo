import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";

export const ShopEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Shop Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter shop name",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Slug"
          name="slug"
          rules={[
            {
              required: true,
              message: "Please enter shop slug",
            },
            {
              pattern: /^[a-z0-9-]+$/,
              message: "Slug must contain only lowercase letters, numbers, and hyphens",
            },
          ]}
        >
          <Input placeholder="my-shop-name" />
        </Form.Item>
        <Form.Item
          label="Tagline"
          name="tagline"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="Published"
          name="storefront_published"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
