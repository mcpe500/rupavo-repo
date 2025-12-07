import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Switch, InputNumber, Select } from "antd";

export const ShopPaymentSettingsEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  const { selectProps: shopSelectProps } = useSelect({
    resource: "shops",
    optionLabel: "name",
    optionValue: "id",
  });

  const bankOptions = [
    "BCA",
    "Mandiri",
    "BNI",
    "BRI",
    "CIMB Niaga",
    "Permata",
    "Danamon",
    "BTN",
    "Maybank",
    "OCBC NISP",
    "Panin",
    "Bank Syariah Indonesia (BSI)",
    "Jenius",
    "Jago",
    "SeaBank",
    "Other",
  ];

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
          <Select {...shopSelectProps} placeholder="Select shop" />
        </Form.Item>

        <Form.Item
          label="Bank Name"
          name="bank_name"
          rules={[
            {
              required: true,
              message: "Please enter bank name",
            },
          ]}
        >
          <Select
            placeholder="Select bank"
            showSearch
            options={bankOptions.map((bank) => ({ label: bank, value: bank }))}
          />
        </Form.Item>

        <Form.Item
          label="Bank Account Number"
          name="bank_account_number"
          rules={[
            {
              required: true,
              message: "Please enter bank account number",
            },
          ]}
        >
          <Input placeholder="1234567890" />
        </Form.Item>

        <Form.Item
          label="Account Holder Name"
          name="bank_account_holder"
          rules={[
            {
              required: true,
              message: "Please enter account holder name",
            },
          ]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>

        <Form.Item
          label="Accept Online Orders"
          name="accept_online_orders"
          valuePropName="checked"
          tooltip="Allow customers to order and pay online through the storefront"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Accept Preorders"
          name="accept_preorders"
          valuePropName="checked"
          tooltip="Allow customers to preorder products (pay first, deliver later)"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Minimum Order Amount"
          name="min_order_amount"
          tooltip="Minimum order amount in Rupiah (leave empty for no minimum)"
        >
          <InputNumber<number>
            style={{ width: "100%" }}
            min={0}
            step={1000}
            formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => Number(value!.replace(/Rp\s?|(,*)/g, "")) || 0}
            placeholder="0"
          />
        </Form.Item>

        <Form.Item
          label="Delivery Available"
          name="delivery_available"
          valuePropName="checked"
          tooltip="Offer delivery service to customers"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Delivery Radius (km)"
          name="delivery_radius_km"
          tooltip="Maximum delivery distance in kilometers"
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={1}
            placeholder="5"
          />
        </Form.Item>

        <Form.Item
          label="Delivery Base Fee"
          name="delivery_base_fee"
          tooltip="Base delivery fee in Rupiah"
        >
          <InputNumber<number>
            style={{ width: "100%" }}
            min={0}
            step={1000}
            formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => Number(value!.replace(/Rp\s?|(,*)/g, "")) || 0}
            placeholder="10000"
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
