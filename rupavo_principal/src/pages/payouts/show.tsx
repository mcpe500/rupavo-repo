import { Show } from "@refinedev/antd";
import { useShow, useUpdate } from "@refinedev/core";
import { Typography, Card, Descriptions, Tag, Space, Timeline, Button, Input } from "antd";
import { useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

export const PayoutShow = () => {
  const { queryResult } = useShow({
    meta: {
      select: "*, shops(name, slug, owner_id)",
    },
  });
  const { data, isLoading } = queryResult;
  const { mutate: updatePayout } = useUpdate();
  
  const [adminNotes, setAdminNotes] = useState("");

  const record = data?.data;

  const statusColors: Record<string, string> = {
    pending: "orange",
    processing: "blue",
    completed: "green",
    failed: "red",
    cancelled: "default",
  };

  const handleStatusUpdate = (status: string) => {
    updatePayout({
      resource: "payouts",
      id: record?.id,
      values: {
        status,
        processed_at: status === "completed" ? new Date().toISOString() : null,
        admin_notes: adminNotes || record?.admin_notes,
      },
      successNotification: {
        message: `Payout ${status}`,
        type: "success",
      },
    });
  };

  return (
    <Show isLoading={isLoading}>
      <Card title="Payout Details" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Payout ID" span={2}>
            <Text code>{record?.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status" span={2}>
            <Tag color={statusColors[record?.status] || "default"}>
              {record?.status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Amount" span={2}>
            <Text strong style={{ fontSize: 18, color: "#52c41a" }}>
              Rp {Number(record?.amount || 0).toLocaleString("id-ID")}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Shop Information" style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Shop Name">
            <Text strong>{record?.shops?.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Shop Slug">
            <Text code>{record?.shops?.slug}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Owner ID">
            <Text code>{record?.shops?.owner_id}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Bank Account Details" style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Bank Name">
            <Tag color="blue">{record?.bank_name}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Account Number">
            <Text code style={{ fontSize: 16 }}>{record?.bank_account_number}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Account Holder Name">
            <Text strong>{record?.bank_account_holder}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Timeline" style={{ marginBottom: 16 }}>
        <Timeline
          items={[
            {
              color: "blue",
              children: (
                <>
                  <Text strong>Payout Requested</Text>
                  <br />
                  <Text type="secondary">
                    {new Date(record?.created_at).toLocaleString("id-ID")}
                  </Text>
                </>
              ),
            },
            record?.processed_at && {
              color: record?.status === "completed" ? "green" : "red",
              children: (
                <>
                  <Text strong>Payout {record?.status === "completed" ? "Completed" : "Processed"}</Text>
                  <br />
                  <Text type="secondary">
                    {new Date(record?.processed_at).toLocaleString("id-ID")}
                  </Text>
                </>
              ),
            },
            {
              color: "gray",
              children: (
                <>
                  <Text strong>Last Updated</Text>
                  <br />
                  <Text type="secondary">
                    {new Date(record?.updated_at).toLocaleString("id-ID")}
                  </Text>
                </>
              ),
            },
          ].filter(Boolean)}
        />
      </Card>

      <Card title="Admin Notes" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <TextArea
            rows={4}
            placeholder="Add notes about this payout (transfer receipt number, issues, etc.)"
            defaultValue={record?.admin_notes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
          
          {record?.status === "pending" && (
            <Space>
              <Button
                type="primary"
                onClick={() => handleStatusUpdate("processing")}
              >
                Start Processing
              </Button>
              <Button
                danger
                onClick={() => handleStatusUpdate("cancelled")}
              >
                Cancel Payout
              </Button>
            </Space>
          )}
          
          {record?.status === "processing" && (
            <Space>
              <Button
                type="primary"
                onClick={() => handleStatusUpdate("completed")}
              >
                Mark as Completed
              </Button>
              <Button
                danger
                onClick={() => handleStatusUpdate("failed")}
              >
                Mark as Failed
              </Button>
            </Space>
          )}
        </Space>
      </Card>
    </Show>
  );
};
