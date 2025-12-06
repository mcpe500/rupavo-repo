import {
  DateField,
  Show,
  TagField,
  TextField,
} from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export const ShopShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>ID</Title>
      <TextField value={record?.id} />
      <Title level={5}>Shop Name</Title>
      <TextField value={record?.name} />
      <Title level={5}>Slug</Title>
      <TextField value={record?.slug} />
      <Title level={5}>Tagline</Title>
      <TextField value={record?.tagline || "-"} />
      <Title level={5}>Description</Title>
      <TextField value={record?.description || "-"} />
      <Title level={5}>Published</Title>
      <TagField
        color={record?.storefront_published ? "green" : "red"}
        value={record?.storefront_published ? "Yes" : "No"}
      />
      <Title level={5}>Owner ID</Title>
      <TextField value={record?.owner_id} />
      <Title level={5}>Created At</Title>
      <DateField value={record?.created_at} format="LLL" />
      <Title level={5}>Updated At</Title>
      <DateField value={record?.updated_at} format="LLL" />
    </Show>
  );
};
