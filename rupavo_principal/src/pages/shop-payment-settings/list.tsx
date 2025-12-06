import { List, useTable, EditButton } from "@refinedev/antd";
import { Table, Space, Tag, Typography, Switch } from "antd";
import { useUpdate } from "@refinedev/core";

const { Text } = Typography;

export const ShopPaymentSettingsList = () => {
  const { tableProps } = useTable({
    resource: "shop_payment_settings",
    meta: {
      select: "*, shops(name, slug)",
    },
  });

  const { mutate: updateSettings } = useUpdate();

  const handleToggle = (id: string, field: string, value: boolean) => {
    updateSettings({
      resource: "shop_payment_settings",
      id,
      values: {
        [field]: value,
      },
      successNotification: {
        message: "Settings updated",
        type: "success",
      },
    });
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex={["shops", "name"]}
          title="Shop"
          render={(value) => <Text strong>{value}</Text>}
        />
        <Table.Column
          dataIndex="bank_name"
          title="Bank"
          render={(value) => value ? <Tag color="blue">{value}</Tag> : <Text type="secondary">Not set</Text>}
        />
        <Table.Column
          dataIndex="bank_account_number"
          title="Account Number"
          render={(value) => value ? <Text code>{value}</Text> : <Text type="secondary">-</Text>}
        />
        <Table.Column
          dataIndex="accept_online_orders"
          title="Accept Online Orders"
          render={(value, record: any) => (
            <Switch
              checked={value}
              onChange={(checked) => handleToggle(record.id, "accept_online_orders", checked)}
            />
          )}
        />
        <Table.Column
          dataIndex="accept_preorders"
          title="Accept Preorders"
          render={(value, record: any) => (
            <Switch
              checked={value}
              onChange={(checked) => handleToggle(record.id, "accept_preorders", checked)}
            />
          )}
        />
        <Table.Column
          dataIndex="delivery_available"
          title="Delivery Available"
          render={(value, record: any) => (
            <Switch
              checked={value}
              onChange={(checked) => handleToggle(record.id, "delivery_available", checked)}
            />
          )}
        />
        <Table.Column
          dataIndex="min_order_amount"
          title="Min Order"
          render={(value) => value ? `Rp ${Number(value).toLocaleString("id-ID")}` : <Text type="secondary">No minimum</Text>}
        />
        <Table.Column
          dataIndex="delivery_base_fee"
          title="Delivery Fee"
          render={(value) => value ? `Rp ${Number(value).toLocaleString("id-ID")}` : <Text type="secondary">-</Text>}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
