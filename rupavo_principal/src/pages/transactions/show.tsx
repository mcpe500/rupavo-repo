import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Descriptions, Tag, Space, Timeline } from "antd";

const { Title, Text } = Typography;

export const TransactionShow = () => {
  const { queryResult } = useShow({
    meta: {
      select: "*, orders(*, shops(name, slug)), shops(name, slug)",
    },
  });
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const statusColors: Record<string, string> = {
    pending: "orange",
    settlement: "green",
    failed: "red",
    expired: "default",
    refunded: "purple",
  };

  return (
    <Show isLoading={isLoading}>
      <Card title="Transaction Details" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Transaction ID" span={2}>
            <Text code>{record?.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Midtrans Order ID" span={2}>
            <Text code>{record?.midtrans_order_id || "-"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Midtrans Transaction ID" span={2}>
            <Text code>{record?.midtrans_transaction_id || "-"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColors[record?.status] || "default"}>
              {record?.status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Midtrans Status">
            <Tag>{record?.midtrans_status?.toUpperCase() || "-"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Payment Provider">
            <Tag color="blue">{record?.payment_provider?.toUpperCase() || "MIDTRANS"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Payment Method">
            <Tag>{record?.payment_method?.toUpperCase() || "ONLINE"}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Shop Information" style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Shop Name">
            {record?.shops?.name || record?.orders?.shops?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Shop Slug">
            <Text code>{record?.shops?.slug || record?.orders?.shops?.slug || "-"}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Amount Breakdown" style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Total Amount">
            <Text strong style={{ fontSize: 16 }}>
              Rp {Number(record?.amount || 0).toLocaleString("id-ID")}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Platform Fee (5%)">
            <Text type="secondary">
              - Rp {Number(record?.platform_fee || 0).toLocaleString("id-ID")}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Merchant Receives">
            <Text strong type="success" style={{ fontSize: 16 }}>
              Rp {Number(record?.merchant_amount || 0).toLocaleString("id-ID")}
            </Text>
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
                  <Text strong>Transaction Created</Text>
                  <br />
                  <Text type="secondary">
                    {new Date(record?.created_at).toLocaleString("id-ID")}
                  </Text>
                </>
              ),
            },
            record?.settled_at && {
              color: "green",
              children: (
                <>
                  <Text strong>Payment Settled</Text>
                  <br />
                  <Text type="secondary">
                    {new Date(record?.settled_at).toLocaleString("id-ID")}
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

      {record?.midtrans_response && (
        <Card title="Midtrans Response (Debug)">
          <pre style={{ 
            background: "#f5f5f5", 
            padding: 16, 
            borderRadius: 4,
            overflow: "auto",
            maxHeight: 400 
          }}>
            {JSON.stringify(record.midtrans_response, null, 2)}
          </pre>
        </Card>
      )}
    </Show>
  );
};
