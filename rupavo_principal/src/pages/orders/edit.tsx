import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";

export const OrderEdit = () => {
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
          label="Source"
          name="source"
          rules={[
            {
              required: true,
              message: "Please select order source",
            },
          ]}
        >
          <Select>
            <Select.Option value="manual">Manual</Select.Option>
            <Select.Option value="storefront">Storefront</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Status"
          name="status"
          rules={[
            {
              required: true,
              message: "Please select status",
            },
          ]}
        >
          <Select>
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Total Amount"
          name="total_amount"
          rules={[
            {
              required: true,
              message: "Please enter total amount",
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
          label="Currency"
          name="currency"
          rules={[
            {
              required: true,
              message: "Please enter currency",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Buyer Name"
          name="buyer_name"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Buyer Contact"
          name="buyer_contact"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Note"
          name="note"
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
