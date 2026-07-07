"use client";

import { useTranslation } from "@repo/i18n";
import { Box } from "../ui/box";
import { Button, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationControlsProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <HStack className="mt-4 items-center justify-between gap-3">
      <Text className="text-sm text-muted-foreground">
        {t("common.paginationSummary", { page, totalPages, total })}
      </Text>
      <HStack className="items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
        >
          <ButtonText>{t("common.previous")}</ButtonText>
        </Button>
        <Box className="min-w-8 items-center">
          <Text className="text-sm font-medium text-foreground">{page}</Text>
        </Box>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onPress={() => onPageChange(page + 1)}
        >
          <ButtonText>{t("common.next")}</ButtonText>
        </Button>
      </HStack>
    </HStack>
  );
}
