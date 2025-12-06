import { List, useTable, ShowButton } from "@refinedev/antd";
import { Table, Space, Tag, Typography, Button } from "antd";
import { useUpdate } from "@refinedev/core";

const { Text } = Typography;

export const PayoutList = () => {
  const { tableProps } = useTable({
    resource: "payouts",
    meta: {
      select: "*, shops(name, slug)",
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

  const { mutate: updatePayout } = useUpdate();

  const handleStatusUpdate = (id: string, status: string) => {
    updatePayout({
      resource: "payouts",
      id,
      values: {
        status,
        processed_at: status === "completed" ? new Date().toISOString() : null,
      },
      successNotification: {
        message: "Payout status updated",
        type: "success",
      },
    });
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="created_at"
          title="Request Date"
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
          render={(value) => <Text strong>{value}</Text>}
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
          dataIndex="bank_name"
          title="Bank"
          render={(value) => <Tag color="blue">{value}</Tag>}
        />
        <Table.Column
          dataIndex="bank_account_number"
          title="Account Number"
          render={(value) => <Text code>{value}</Text>}
        />
        <Table.Column
          dataIndex="bank_account_holder"
          title="Account Holder"
        />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value) => {
            const statusColors: Record<string, string> = {
              pending: "orange",
              processing: "blue",
              completed: "green",
              failed: "red",
              cancelled: "default",
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
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space direction="vertical" size="small">
              <Space>
                <ShowButton hideText size="small" recordItemId={record.id} />
                {record.status === "pending" && (
                  <>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleStatusUpdate(record.id, "processing")}
                    >
                      Process
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() => handleStatusUpdate(record.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {record.status === "processing" && (
                  <>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleStatusUpdate(record.id, "completed")}
                    >
                      Complete
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() => handleStatusUpdate(record.id, "failed")}
                    >
                      Mark Failed
                    </Button>
                  </>
                )}
              </Space>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
