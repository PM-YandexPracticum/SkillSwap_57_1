import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { requestsReducer } from "@/entities/request/model/requestsSlice";
import {
  addNotification,
  loadNotifications,
  markNotificationsRead,
  notificationsReducer,
  selectNewNotifications,
  type AppNotification,
} from "@/features/notifications/model/notificationsSlice";
import { SwapRequestButton } from "./SwapRequestButton";

vi.mock("@/features/auth/model/useRequireAuth", () => ({
  useRequireAuth: () => (callback: () => void) => callback(),
}));
vi.mock("./SwapRequestSuccessModal", () => ({
  SwapRequestSuccessModal: () => <div>Предложение отправлено</div>,
}));

afterEach(cleanup);

const makeStore = (userId: string | null = "sender") =>
  configureStore({
    reducer: {
      notifications: notificationsReducer,
      requests: requestsReducer,
      auth: () => ({ userId }),
      users: () => ({
        items: [{ id: "owner", name: "Тестовый пользователь" }],
      }),
    },
  });

describe("предложение обмена и уведомления", () => {
  it("создаёт заявку и новое уведомление отправителю, повторный клик не дублирует их", () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <SwapRequestButton skillId="skill-1" ownerId="owner" />
      </Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Предложить обмен" }));

    expect(store.getState().requests.items).toHaveLength(1);
    expect(store.getState().notifications.items).toHaveLength(1);
    const notification = store.getState().notifications.items[0];
    expect(notification).toMatchObject({
      userId: "sender",
      skillId: "skill-1",
      text: "Вы предложили обмен",
      description:
        "Ваше предложение отправлено пользователю Тестовый пользователь.",
      isRead: false,
    });
    expect(Number.isNaN(Date.parse(notification.createdAt))).toBe(false);
    expect(notification.id).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Обмен предложен" }));
    expect(store.getState().requests.items).toHaveLength(1);
    expect(store.getState().notifications.items).toHaveLength(1);
  });

  it("без авторизации не создаёт заявку или уведомление", () => {
    const store = makeStore(null);
    render(
      <Provider store={store}>
        <SwapRequestButton skillId="skill-1" ownerId="owner" />
      </Provider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Предложить обмен" }));
    expect(store.getState().requests.items).toHaveLength(0);
    expect(store.getState().notifications.items).toHaveLength(0);
  });

  it("не показывает кнопку для собственного навыка", () => {
    const store = makeStore("owner");
    render(
      <Provider store={store}>
        <SwapRequestButton skillId="skill-1" ownerId="owner" />
      </Provider>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("завершение загрузки моков сохраняет созданное уведомление и его отметку прочтения", () => {
    const store = makeStore();
    const notification: AppNotification = {
      id: "local-1",
      userId: "sender",
      text: "Вы предложили обмен",
      description: "Предложение отправлено",
      createdAt: "2026-10-19T10:00:00.000Z",
      isRead: false,
    };
    store.dispatch(loadNotifications.pending("request-1", undefined));
    store.dispatch(addNotification(notification));
    store.dispatch(
      markNotificationsRead({ userId: "sender", ids: ["local-1"] }),
    );
    store.dispatch(
      loadNotifications.fulfilled(
        [
          { ...notification, isRead: false },
          { ...notification, id: "mock-1", userId: "other" },
        ],
        "request-1",
        undefined,
      ),
    );

    expect(store.getState().notifications.items).toHaveLength(2);
    expect(store.getState().notifications.items[0].isRead).toBe(true);
    expect(store.getState().notifications.status).toBe("succeeded");
  });

  it("уведомление до первого открытия сохраняется после загрузки и не попадает к владельцу навыка", () => {
    const store = makeStore();
    const notification: AppNotification = {
      id: "local-1",
      userId: "sender",
      text: "Вы предложили обмен",
      description: "Предложение отправлено",
      createdAt: "2026-10-19T10:00:00.000Z",
      isRead: false,
    };
    store.dispatch(addNotification(notification));
    expect(store.getState().notifications.status).toBe("idle");
    store.dispatch(loadNotifications.pending("request-1", undefined));
    store.dispatch(loadNotifications.fulfilled([], "request-1", undefined));
    expect(store.getState().notifications.items).toEqual([notification]);
    // Эти селекторы используют только ветку notifications.
    expect(
      selectNewNotifications(
        store.getState() as Parameters<typeof selectNewNotifications>[0],
        "owner",
      ),
    ).toEqual([]);
  });
});
