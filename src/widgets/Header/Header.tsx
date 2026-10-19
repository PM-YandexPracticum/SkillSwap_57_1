import styles from "./Header.module.css";
import { generatePath, NavLink, useNavigate } from "react-router-dom";
import { User } from "@/shared/types";
import { Logo } from "@/shared/ui/Logo";
import { ROUTES } from "@/shared/lib/constants";
import { Button } from "@/shared/ui/Button";
import Chevron from "@/shared/assets/icons/chevron.svg?react";
import Moon from "@/shared/assets/icons/moon.svg?react";
import Heart from "@/shared/assets/icons/heart.svg?react";
import Bell from "@/shared/assets/icons/bell.svg?react";
import Close from "@/shared/assets/icons/close.svg?react";
import LogoutIcon from "@/shared/assets/icons/logout.svg?react";
import { SearchInput } from "@/shared/ui/SearchInput";
import { Avatar } from "@/shared/ui/Avatar";
import { IconButton } from "@/shared/ui/IconButton";
import { Popover } from "@/shared/ui/Popover";
import { TextLink } from "@/shared/ui/TextLink";
import {
  clearReadNotifications,
  loadNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
  selectNewNotifications,
  selectReadNotifications,
  selectNewNotificationsCount,
} from "@/features/notifications";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAuthUserId } from "@/features/auth/model/authSlice";
import { NotificationsPanel } from "@/features/notifications";
import { createPortal } from "react-dom";

type HeaderProps = {
  user?: User;
  variant?: "default" | "auth";
  skillsPanel?: ReactNode;
  onLogout?: () => void;
  /** Управляемое значение поискового поля (для default-варианта) */
  searchValue?: string;
  /** Обработчик ввода в поисковое поле */
  onSearchChange?: (value: string) => void;
};

export const Header = ({
  user,
  variant = "default",
  skillsPanel,
  onLogout,
  searchValue = "",
  onSearchChange,
}: HeaderProps) => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectAuthUserId);
  const notificationsStatus = useAppSelector(
    (state) => state.notifications.status,
  );
  const newNotifications = useAppSelector((state) =>
    userId ? selectNewNotifications(state, userId) : [],
  );
  const readNotifications = useAppSelector((state) =>
    userId ? selectReadNotifications(state, userId) : [],
  );
  const newNotificationsCount = useAppSelector((state) =>
    userId ? selectNewNotificationsCount(state, userId) : 0,
  );
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [openedForUserId, setOpenedForUserId] = useState<string | null>(null);
  const isPanelOpen = Boolean(userId && openedForUserId === userId);

  const bellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const shownNotificationsRef = useRef<{
    userId: string;
    ids: Set<string>;
  } | null>(null);

  useEffect(() => {
    if (!isPanelOpen || notificationsStatus !== "succeeded" || !userId) return;

    if (shownNotificationsRef.current?.userId !== userId) {
      shownNotificationsRef.current = {
        userId,
        ids: new Set(),
      };
    }

    newNotifications.forEach((notification) => {
      shownNotificationsRef.current?.ids.add(notification.id);
    });
  }, [isPanelOpen, notificationsStatus, userId, newNotifications]);

  const closePanel = useCallback(() => {
    const shown = shownNotificationsRef.current;

    if (
      notificationsStatus === "succeeded" &&
      userId &&
      shown?.userId === userId &&
      shown.ids.size > 0
    ) {
      dispatch(
        markNotificationsRead({
          userId,
          ids: [...shown.ids],
        }),
      );
    }

    shownNotificationsRef.current = null;
    setOpenedForUserId(null);
  }, [dispatch, notificationsStatus, userId]);

  const handleBellClick = () => {
    if (!userId) return;

    if (isPanelOpen) {
      closePanel();
      return;
    }

    shownNotificationsRef.current = {
      userId,
      ids: new Set(),
    };
    setOpenedForUserId(userId);

    if (notificationsStatus === "idle" || notificationsStatus === "failed") {
      dispatch(loadNotifications());
    }
  };

  const handleReadAll = () => {
    if (!userId) return;

    dispatch(markAllNotificationsRead({ userId }));
  };

  const handleClearRead = () => {
    if (!userId) return;

    dispatch(clearReadNotifications({ userId }));
  };

  const handleNavigate = (notificationId: string) => {
    if (!userId) return;

    const notification = [...newNotifications, ...readNotifications].find(
      (item) => item.id === notificationId,
    );
    // Старые моки без связи с навыком не позволяют определить адрес перехода.
    if (!notification?.skillId) return;

    dispatch(
      markNotificationsRead({
        userId,
        ids: [notificationId],
      }),
    );

    closePanel();
    navigate(generatePath(ROUTES.SKILL, { id: notification.skillId }));
  };

  useEffect(() => {
    if (!isPanelOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      const clickedBell = bellRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);

      if (!clickedBell && !clickedPanel) {
        closePanel();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPanelOpen, closePanel]);

  useEffect(() => {
    shownNotificationsRef.current = null;
    setOpenedForUserId(null);
  }, [userId]);

  if (variant === "auth") {
    return (
      <header className={styles.headerAuth}>
        <NavLink to={ROUTES.HOME} className={styles.logo}>
          <Logo />
        </NavLink>
        <Button
          variant="tertiary"
          iconRight={<Close />}
          onClick={() => navigate(ROUTES.HOME)}
        >
          Закрыть
        </Button>
      </header>
    );
  }

  const skillsButton = (
    <Button
      iconRight={
        <Chevron
          className={`${styles.chevron} ${isSkillsOpen ? styles.chevronOpen : ""}`}
        />
      }
      variant="link"
      className={styles.colorText}
      onClick={() => setIsSkillsOpen((open) => !open)}
    >
      Все&nbsp;навыки
    </Button>
  );

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to={ROUTES.HOME} className={styles.logo}>
          <Logo />
        </NavLink>
        <div className={styles.navText}>
          <Button variant="link" className={styles.colorText}>
            О&nbsp;проекте
          </Button>
          {skillsPanel ? (
            <Popover
              trigger={skillsButton}
              open={isSkillsOpen}
              onClose={() => setIsSkillsOpen(false)}
              rootClassName={styles.popoverRoot}
              className={styles.categoriesContainer}
            >
              {skillsPanel}
            </Popover>
          ) : (
            skillsButton
          )}
        </div>
      </nav>
      <search>
        <SearchInput
          value={searchValue}
          onChange={(text) => onSearchChange?.(text)}
          onClear={() => onSearchChange?.("")}
          placeholder="Искать навык"
        />
      </search>
      {!user && (
        <div className={styles.rightHeader}>
          <IconButton label="Переключить тему" icon={<Moon />} />
          <div className={styles.buttons}>
            <Button variant="secondary" onClick={() => navigate(ROUTES.LOGIN)}>
              Войти
            </Button>
            <Button onClick={() => navigate(ROUTES.REGISTER)}>
              Зарегистрироваться
            </Button>
          </div>
        </div>
      )}

      {user && (
        <div className={`${styles.rightHeader} ${styles.rightHeaderWithUser}`}>
          <div className={styles.svgButtons}>
            <IconButton label="Переключить тему" icon={<Moon />} />

            <div className={styles.notificationsRoot} ref={bellRef}>
              <IconButton
                type="button"
                label="Уведомления"
                icon={<Bell />}
                onClick={handleBellClick}
                badge={newNotificationsCount > 0}
              />
            </div>

            <IconButton
              label="Перейти в избранное"
              icon={<Heart />}
              onClick={() => navigate(ROUTES.FAVORITES)}
            />
          </div>

          <div>
            <Popover
              className={styles.profilePopover}
              align={"right"}
              trigger={
                <button
                  onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                  className={styles.user}
                >
                  <h4 className={styles.userText}>{user.name}</h4>
                  <Avatar src={user.avatarUrl} alt="Пользователь" size="s" />
                </button>
              }
              open={isUserMenuOpen}
              onClose={() => setUserMenuOpen(!isUserMenuOpen)}
            >
              <span onClick={() => setUserMenuOpen(!isUserMenuOpen)}>
                <TextLink
                  variant={"default"}
                  to={ROUTES.PROFILE}
                  className={styles.profileButtons}
                >
                  Личный&nbsp;кабинет
                </TextLink>
              </span>
              <Button
                variant={"link"}
                onClick={() => {
                  setUserMenuOpen(!isUserMenuOpen);
                  if (onLogout) {
                    onLogout();
                  }
                }}
                iconRight={<LogoutIcon />}
                className={styles.profileButtons}
              >
                Выйти из&nbsp;аккаунта
              </Button>
            </Popover>
          </div>
        </div>
      )}
      {user &&
        isPanelOpen &&
        createPortal(
          <div ref={panelRef} className={styles.notificationsPanel}>
            <NotificationsPanel
              newNotifications={newNotifications}
              readNotifications={readNotifications}
              onReadAll={handleReadAll}
              onClearRead={handleClearRead}
              onNavigate={handleNavigate}
            />
          </div>,
          document.body,
        )}
    </header>
  );
};
