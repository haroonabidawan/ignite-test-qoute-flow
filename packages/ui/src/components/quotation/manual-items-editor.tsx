"use client";

import { useTranslation } from "@repo/i18n";
import type { QuotationItem } from "@repo/types";
import { Box } from "../ui/box";
import { Button, ButtonText } from "../ui/button";
import { Icon, AddIcon, TrashIcon } from "../ui/icon/index.web";
import {
  Table,
  TableBody,
  TableData,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Text } from "../ui/text";
import { InlineInputField } from "../forms/fields";
import { SectionCard } from "../common/section-card";
import { createId } from "../../lib/format";
import { calculateItemTotal } from "../../lib/calculations";
import { useFormatCurrency } from "../../lib/format";

type ManualItemsEditorProps = {
  items: QuotationItem[];
  onChange: (items: QuotationItem[]) => void;
  title?: string;
  description?: string;
};

export function ManualItemsEditor({
  items,
  onChange,
  title,
  description,
}: ManualItemsEditorProps) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();

  const updateItem = (itemId: string, patch: Partial<QuotationItem>) => {
    onChange(items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        id: createId("item"),
        title: "",
        description: "",
        quantity: 1,
        unitPrice: null,
        estimatedHours: null,
      },
    ]);
  };

  const removeItem = (itemId: string) => {
    onChange(items.filter((item) => item.id !== itemId));
  };

  return (
    <SectionCard
      title={title ?? t("quotations.create.manual.itemsTitle")}
      description={description ?? t("quotations.create.manual.itemsDescription")}
      action={
        <Button size="sm" variant="outline" onPress={addItem}>
          <Icon as={AddIcon} size="sm" />
          <ButtonText>{t("quotations.create.manual.addLine")}</ButtonText>
        </Button>
      }
    >
      {items.length === 0 ? (
        <Box className="rounded-lg border border-dashed border-border p-6 text-center">
          <Text className="text-sm text-muted-foreground">
            {t("quotations.create.manual.emptyItems")}
          </Text>
          <Button size="sm" variant="outline" className="mt-3" onPress={addItem}>
            <ButtonText>{t("quotations.create.manual.addFirstLine")}</ButtonText>
          </Button>
        </Box>
      ) : (
        <Box className="overflow-x-auto rounded-xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>{t("quotations.create.table.title")}</TableHead>
                <TableHead>{t("quotations.create.table.description")}</TableHead>
                <TableHead>{t("quotations.create.table.qty")}</TableHead>
                <TableHead>{t("quotations.create.table.unitPrice")}</TableHead>
                <TableHead>{t("quotations.create.table.hours")}</TableHead>
                <TableHead className="text-end">
                  {t("quotations.create.table.lineTotal")}
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="ui-table-row align-top">
                  <TableData>
                    <InlineInputField
                      value={item.title}
                      onChangeText={(v) => updateItem(item.id, { title: v })}
                      placeholder={t("quotations.detail.itemName")}
                      className="min-w-[140px]"
                    />
                  </TableData>
                  <TableData>
                    <InlineInputField
                      value={item.description}
                      onChangeText={(v) => updateItem(item.id, { description: v })}
                      className="min-w-[160px]"
                    />
                  </TableData>
                  <TableData>
                    <InlineInputField
                      type="number"
                      min={0}
                      value={String(item.quantity)}
                      onChangeText={(v) => {
                        const parsed = Number(v);
                        updateItem(item.id, {
                          quantity: Number.isNaN(parsed) ? 1 : parsed,
                        });
                      }}
                      className="w-20"
                    />
                  </TableData>
                  <TableData>
                    <InlineInputField
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitPrice === null ? "" : String(item.unitPrice)}
                      placeholder={t("common.tbd")}
                      onChangeText={(v) => {
                        if (v === "") {
                          updateItem(item.id, { unitPrice: null });
                          return;
                        }
                        const parsed = Number(v);
                        updateItem(item.id, {
                          unitPrice: Number.isNaN(parsed) ? null : parsed,
                        });
                      }}
                      className="w-24"
                    />
                  </TableData>
                  <TableData>
                    <InlineInputField
                      type="number"
                      min={0}
                      step="0.5"
                      value={
                        item.estimatedHours === null ? "" : String(item.estimatedHours)
                      }
                      placeholder={t("common.dash")}
                      onChangeText={(v) => {
                        if (v === "") {
                          updateItem(item.id, { estimatedHours: null });
                          return;
                        }
                        const parsed = Number(v);
                        updateItem(item.id, {
                          estimatedHours: Number.isNaN(parsed) ? null : parsed,
                        });
                      }}
                      className="w-20"
                    />
                  </TableData>
                  <TableData className="pt-3 text-end tabular-nums font-medium">
                    {formatCurrency(calculateItemTotal(item.quantity, item.unitPrice))}
                  </TableData>
                  <TableData className="pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => removeItem(item.id)}
                      aria-label={t("quotations.detail.removeLineItem")}
                    >
                      <Icon as={TrashIcon} size="sm" className="text-destructive" />
                    </Button>
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </SectionCard>
  );
}
