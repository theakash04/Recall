"use client";
import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  PanelLeft,
  MoonIcon,
  SunIcon,
  DownloadIcon,
  MessagesSquare,
} from "lucide-react";
import Link from "next/link";
import { useSidebarStore } from "@/store/sideBarStore";
import { useUserStore } from "@/store/useStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import useViewport from "@/hooks/useViewPort";
import { useTheme } from "next-themes";
import { logoutUser } from "@/lib/userApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FullScreenLoader from "../Loading";

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  href?: string;
  hasSubmenu?: boolean;
  submenuId?: string;
  disabled?: boolean;
  submenuItems?: { label: string; href: string }[];
  onClick?: () => void;
  className?: string;
};

const NavItem = ({
  icon,
  label,
  href,
  hasSubmenu = false,
  submenuId,
  submenuItems = [],
  onClick,
  disabled = false,
  className = "",
}: NavItemProps) => {
  const { isExpanded, activeSubmenu, setActiveSubmenu } = useSidebarStore();
  const isSubmenuOpen = activeSubmenu === submenuId;
  const [isActive, setIsActive] = useState<boolean>(false);

  const handleClick = () => {
    if (hasSubmenu && isExpanded) {
      setActiveSubmenu(isSubmenuOpen ? null : submenuId || null);
    }
  };

  const pathname = usePathname();

  useEffect(() => {
    if (href) {
      setIsActive(pathname === href);
    } else if (submenuItems.length > 0) {
      const isSubmenuActive = submenuItems.some(
        (item) => pathname === item.href
      );
      setIsActive(isSubmenuActive);
    } else {
      setIsActive(false);
    }
  }, [pathname, href, submenuItems]);

  const Component = href ? Link : "button";

  return (
    <div className="relative px-2 overflow-visible group">
      <Component
        href={href as string}
        disabled={disabled}
        onClick={() => {
          if (hasSubmenu) {
            handleClick();
          }
          if (onClick) {
            onClick();
          }
        }}
        type={!href ? "button" : undefined}
        className={`flex items-center py-2 px-3 rounded-md w-full transition-colors ${
          isActive
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent"
        }${className} cursor-pointer`}
      >
        <div
          className={`flex gap-4 items-center w-full ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
        >
          <span
            className={`${
              label === "Logout"
                ? "text-destructive"
                : "text-sidebar-foreground"
            }`}
          >
            {icon}
          </span>
          {isExpanded && (
            <span
              className={`text-sm font-medium transition-opacity duration-200 `}
            >
              {label}
            </span>
          )}
          {hasSubmenu && isExpanded && (
            <motion.span
              className="ml-auto"
              animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.span>
          )}
        </div>
      </Component>

      {/* Tooltip */}
      {!isExpanded && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 bg-muted text-sm text-foreground px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {label}
        </div>
      )}

      {/* Submenu */}
      {hasSubmenu && isExpanded && (
        <AnimatePresence>
          {isSubmenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pl-9 pr-3 py-1 space-y-1">
                {submenuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="block py-2 px-2 text-sm text-sidebar-foreground hover:bg-sidebar-hover rounded-md transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export function Sidebar() {
  const queryClient = useQueryClient();
  const viewport = useViewport();
  const { isExpanded, setExpanded, toggleSidebar } = useSidebarStore();
  const { userData, clearUser } = useUserStore();
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  const collapseOnMobile = () => {
    if (viewport === "mobile") {
      setExpanded(false);
    }
  };

  useEffect(() => {
    if (viewport === "mobile") {
      setExpanded(false);
    } else if (viewport === "large") {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [viewport, setExpanded]);

  const { mutateAsync, isIdle } = useMutation({
    mutationFn: logoutUser,
    onSuccess() {
      queryClient.cancelQueries({ queryKey: ["user"] });
      router.replace("/");
      clearUser();
      toast.info("Logout successfully!");
    },
    onError() {
      toast.error("Logout failed!");
    },
  });

  if (!isIdle) {
    return <FullScreenLoader />;
  }

  return (
    <motion.div
      className={`
        flex flex-col h-screen border-r border-sidebar-border bg-background
        ${
          viewport === "mobile"
            ? isExpanded
              ? "absolute top-0 left-0 z-50 shadow-lg w-[240px]"
              : "hidden"
            : "sticky top-0 z-40"
        }
      `}
      animate={{ width: isExpanded ? 240 : 72 }}
      transition={{ duration: 0.1 }}
    >
      {/* Profile Section */}
      <div className="p-4 flex items-center border-b border-sidebar-border justify-between">
        <div className="flex items-center justify-start">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Avatar className="h-full w-full rounded-full">
              <AvatarImage
                src={userData?.avatar_url}
                alt={userData?.full_name}
              />
              <AvatarFallback className="rounded-full">
                {userData?.full_name
                  ? userData.full_name.charAt(0).toUpperCase()
                  : "U"}
                <span className="sr-only">{userData?.full_name}</span>
              </AvatarFallback>
            </Avatar>
          </div>

          {isExpanded && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userData?.full_name || "User Name"}
              </p>
            </div>
          )}
        </div>

        {viewport === "mobile" && isExpanded && (
          <div className="text-foreground/60" onClick={() => toggleSidebar()}>
            <PanelLeft size={18} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-2 space-y-1 overflow-visible">
        <NavItem
          icon={<Home size={20} />}
          label="Dashboard"
          href="/dashboard"
          onClick={collapseOnMobile}
        />
        {/* <NavItem */}
        {/*   icon={<BotIcon size={20} />} */}
        {/*   label="Chat" */}
        {/*   href="/chat" */}
        {/*   onClick={collapseOnMobile} */}
        {/* /> */}
        <NavItem
          icon={<Settings size={18} />}
          label="Settings"
          href="/settings"
          onClick={collapseOnMobile}
        />
        <NavItem
          icon={<MessagesSquare size={18} />}
          label="Feedback"
          href="/feedback"
          onClick={collapseOnMobile}
        />
      </div>
      <div className=" border-sidebar-border py-2 space-y-1 w-full">
        <NavItem
          icon={
            theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />
          }
          label="Change Theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        {/* {isExpanded ? (
          <div className="px-3 py-4 mx-2 rounded-md bg-muted/40 text-sm flex flex-col items-start gap-3 border border-muted">
            <div className="font-medium text-foreground">Get the Extension</div>
            <p className="text-muted-foreground text-xs leading-snug">
              Install our browser extension to save bookmarks instantly.
            </p>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition "
            >
              Download Extension
            </a>
          </div>
        ) : (
          <NavItem
            icon={<DownloadIcon size={18} />} // or a download icon like `DownloadIcon`
            label="Download Extension"
            onClick={() => {
              window.open("#", "_blank");
            }}
          />
        )} */}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border py-2 space-y-1 w-full">
        <NavItem
          icon={<HelpCircle size={18} />}
          label="Help"
          href="/help"
          onClick={collapseOnMobile}
        />
        <NavItem
          icon={<LogOut size={18} />}
          label="Logout"
          disabled={!isIdle}
          onClick={async () => await mutateAsync()}
        />
      </div>
    </motion.div>
  );
}
