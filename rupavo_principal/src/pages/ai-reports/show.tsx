import {
  DateField,
  Show,
  TagField,
  TextField,
} from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography, Card, Divider } from "antd";

const { Title, Paragraph } = Typography;

export const AIReportShow = () => {
  const { query: queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const { query: shopQuery } = useOne({
    resource: "shops",
    id: record?.shop_id || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  const getGranularityColor = (granularity: string) => {
    switch (granularity) {
      case "daily":
        return "blue";
      case "weekly":
        return "green";
      case "monthly":
        return "purple";
      case "custom":
        return "orange";
      default:
        return "default";
    }
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Report ID</Title>
      <TextField value={record?.id} />
      
      <Title level={5}>Shop</Title>
      {shopQuery.isLoading ? <>Loading...</> : <TextField value={shopQuery.data?.data?.name} />}
      
      <Title level={5}>Period Type</Title>
      <TagField color={getGranularityColor(record?.granularity)} value={record?.granularity} />
      
      <Title level={5}>Period</Title>
      <Paragraph>
        <DateField value={record?.period_start} format="LL" /> 
        {" to "}
        <DateField value={record?.period_end} format="LL" />
      </Paragraph>

      <Divider />

      <Title level={4}>Metrics</Title>
      {record?.metrics ? (
        <Card>
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {JSON.stringify(record.metrics, null, 2)}
          </pre>
        </Card>
      ) : (
        <TextField value="No metrics data" />
      )}

      <Divider />

      <Title level={4}>AI Narrative</Title>
      {record?.narrative ? (
        <Card>
          <Paragraph style={{ whiteSpace: "pre-wrap" }}>
            {record.narrative}
          </Paragraph>
        </Card>
      ) : (
        <TextField value="No narrative available" />
      )}

      <Divider />

      <Title level={5}>Generated At</Title>
      <DateField value={record?.created_at} format="LLL" />
    </Show>
  );
};
