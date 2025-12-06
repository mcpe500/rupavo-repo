import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag, Typography } from "antd";

const { Text } = Typography;

export const TransactionList = () => {
  const { tableProps } = useTable({
    resource: "transactions",
    meta: {
      select: "*, orders(id, shop_id, shops(name, slug)), shops(name, slug)",
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="created_at"
          title="Date"
          render={(value) => new Date(value).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          sorter
        />
        <Table.Column
          dataIndex={["shops", "name"]}
          title="Shop"
          render={(value, record: any) => (
            <Text>{value || record.orders?.shops?.name || "-"}</Text>
          )}
        />
        <Table.Column
          dataIndex="midtrans_order_id"
          title="Order ID"
          render={(value) => (
            <Text code>{value || "-"}</Text>
          )}
        />
        <Table.Column
          dataIndex="amount"
          title="Amount"
          render={(value) => (
            <Text strong>Rp {Number(value).toLocaleString("id-ID")}</Text>
          )}
          sorter
        />
        <Table.Column
          dataIndex="merchant_amount"
          title="Merchant Receives"
          render={(value) => (
            <Text type="success">Rp {Number(value).toLocaleString("id-ID")}</Text>
          )}
        />
        <Table.Column
          dataIndex="platform_fee"
          title="Platform Fee"
          render={(value) => (
            <Text type="secondary">Rp {Number(value || 0).toLocaleString("id-ID")}</Text>
          )}
        />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value) => {
            const statusColors: Record<string, string> = {
              pending: "orange",
              settlement: "green",
              failed: "red",
              expired: "default",
              refunded: "purple",
            };
            return (
              <Tag color={statusColors[value] || "default"}>
                {value?.toUpperCase()}
              </Tag>
            );
          }}
          sorter
        />
        <Table.Column
          dataIndex="payment_method"
          title="Payment Method"
          render={(value) => (
            <Tag>{value?.toUpperCase() || "ONLINE"}</Tag>
          )}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
