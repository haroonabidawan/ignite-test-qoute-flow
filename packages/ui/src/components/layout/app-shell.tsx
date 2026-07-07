"use client";

import { Box } from "../../components/ui/box";
import { Button, ButtonText } from "../../components/ui/button";
import { Heading } from "../../components/ui/heading";
import { HStack } from "../../components/ui/hstack";
import { Text } from "../../components/ui/text";
import { VStack } from "../../components/ui/vstack";
import { UserAvatar } from "../../components/common/user-avatar";
import { QuoteFlowMark } from "../../components/common/quote-flow-mark";
import { LanguageSwitcher } from "../../components/common/language-switcher";
import {
  Icon,
  AddIcon,
  ArrowLeftIcon,
  EditIcon,
  GlobeIcon,
  LogOutIcon,
  SettingsIcon,
} from "../../components/ui/icon/index.web";
import { useLogout, useQuotationsLookup, useSession } from "@repo/api/hooks";
import { useTranslation } from "@repo/i18n";
import { useNavigate, usePathname } from "../../navigation/navigation-context";

const navItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: SettingsIcon },
  { href: "/quotations", labelKey: "nav.quotations", icon: EditIcon },
  { href: "/clients", labelKey: "nav.clients", icon: GlobeIcon },
] as const;

function NavLink({
  href,
  labelKey,
  icon: NavIcon,
}: {
  href: string;
  labelKey: string;
  icon: typeof EditIcon;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const navigate = useNavigate();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <button
      type="button"
      onClick={() => navigate(href)}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-medium transition-colors ${
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      }`}
    >
      <Icon
        as={NavIcon}
        size="sm"
        className={
          active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70"
        }
      />
      {t(labelKey)}
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user } = useSession();
  const logout = useLogout();
  const { data: quotationsPage } = useQuotationsLookup();
  const quotations = quotationsPage?.items ?? [];
  const navigate = useNavigate();

  const draftCount = quotations.filter((q) => q.status === "Draft").length;

  return (
    <Box className="min-h-screen bg-background lg:flex-row">
      <Box className="relative hidden h-screen w-72 shrink-0 overflow-hidden border-e border-sidebar-border ui-sidebar-shell lg:sticky lg:top-0 lg:flex lg:flex-col">
        <Box className="shrink-0 border-b border-sidebar-border px-5 py-6">
          <HStack space="md" className="items-center">
            <QuoteFlowMark size="md" />
            <VStack space="xs">
              <Heading size="sm" className="text-sidebar-foreground">
                {t("common.appName")}
              </Heading>
              <Text className="text-xs text-sidebar-foreground/60">
                {t("common.tagline")}
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Box className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
          <VStack space="xs">
            <Text className="px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
              {t("nav.workspace")}
            </Text>
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </VStack>

          <Box className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4">
            <Text className="text-xs font-medium text-sidebar-foreground/70">
              {t("nav.pipelineSnapshot")}
            </Text>
            <Box className="mt-3 grid grid-cols-2 gap-3">
              <Box>
                <Text className="text-lg font-semibold text-sidebar-foreground">
                  {quotations.length}
                </Text>
                <Text className="text-xs text-sidebar-foreground/60">
                  {t("nav.quotes")}
                </Text>
              </Box>
              <Box>
                <Text className="text-lg font-semibold text-sidebar-foreground">
                  {draftCount}
                </Text>
                <Text className="text-xs text-sidebar-foreground/60">
                  {t("nav.drafts")}
                </Text>
              </Box>
            </Box>
            <Button
              size="sm"
              className="mt-4 w-full bg-sidebar-primary"
              onPress={() => navigate("/quotations/new")}
            >
              <Icon
                as={AddIcon}
                size="sm"
                className="text-sidebar-primary-foreground"
              />
              <ButtonText className="text-sidebar-primary-foreground">
                {t("nav.newQuotation")}
              </ButtonText>
            </Button>
          </Box>
        </Box>

        <Box className="shrink-0 border-t border-sidebar-border px-4 py-4">
          <Box className="flex-row items-center gap-3">
            <UserAvatar
              name={user?.name ?? user?.email ?? t("common.user")}
              size="md"
              className="bg-sidebar-primary text-sidebar-primary-foreground ring-sidebar-border"
            />
            <Box className="min-w-0 flex-1">
              <Text className="truncate text-sm font-medium leading-snug text-sidebar-foreground">
                {user?.name ?? t("common.user")}
              </Text>
              <Text className="truncate text-xs leading-snug text-sidebar-foreground/55">
                {user?.email}
              </Text>
            </Box>
            <HStack space="xs" className="shrink-0 items-center">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-destructive"
                aria-label={t("nav.signOut")}
                onPress={() => {
                  logout.mutate(undefined, {
                    onSettled: () => navigate("/auth/login"),
                  });
                }}
              >
                <Icon as={LogOutIcon} size="sm" className="stroke-current" />
              </Button>
            </HStack>
          </Box>
        </Box>
      </Box>

      <Box className="flex min-w-0 flex-1 flex-col">
        <Box className="border-b border-border/80 bg-card/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:hidden">
          <HStack className="items-center justify-between">
            <Heading size="md">{t("common.appName")}</Heading>
            <HStack space="sm" className="items-center">
              <LanguageSwitcher />
              <Button size="sm" onPress={() => navigate("/quotations/new")}>
                <ButtonText>{t("common.new")}</ButtonText>
              </Button>
            </HStack>
          </HStack>
          <HStack space="sm" className="mt-3">
            {navItems.map((item) => (
              <Button
                key={item.href}
                size="sm"
                variant="outline"
                onPress={() => navigate(item.href)}
              >
                <ButtonText>{t(item.labelKey)}</ButtonText>
              </Button>
            ))}
          </HStack>
        </Box>

        <Box className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Box className="mx-auto w-full max-w-7xl">{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(href)}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <Icon as={ArrowLeftIcon} size="sm" />
      {label}
    </button>
  );
}
