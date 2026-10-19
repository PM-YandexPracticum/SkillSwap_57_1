import { configureStore } from "@reduxjs/toolkit";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import {
  notificationsReducer,
  type AppNotification,
} from "@/features/notifications";
import type { User } from "@/shared/types";
import { Header } from "./Header";

afterEach(cleanup);

const currentUser: User = {
  id: "sender",
  name: "Тестовый отправитель",
  email: "test@example.com",
  password: "",
  avatarUrl: null,
  birthDate: "1996-01-01",
  gender: "unspecified",
  cityId: "city-1",
  about: "",
  learnSubcategoryIds: [],
  teachSkillId: "own-skill",
  likesCount: 0,
  createdAt: "2026-10-19T10:00:00.000Z",
};

const notification: AppNotification = {
  id: "notification-1",
  userId: "sender",
  skillId: "offered-skill",
  text: "Вы предложили обмен",
  description: "Предложение отправлено",
  createdAt: "2026-10-19T10:00:00.000Z",
  isRead: false,
};

const Location = () => (
  <output aria-label="Текущий адрес">{useLocation().pathname}</output>
);

it("открывает именно навык из уведомления и отмечает все показанные новые просмотренными", () => {
  const otherShown = {
    ...notification,
    id: "notification-2",
    skillId: "another-skill",
  };
  const foreign = { ...notification, id: "foreign", userId: "other-user" };
  const store = configureStore({
    reducer: {
      notifications: notificationsReducer,
      auth: () => ({ userId: "sender" }),
    },
    preloadedState: {
      notifications: {
        items: [notification, otherShown, foreign],
        status: "succeeded" as const,
        error: null,
      },
      auth: { userId: "sender" },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Header user={currentUser} />
        <Location />
      </MemoryRouter>
    </Provider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Уведомления" }));
  fireEvent.click(screen.getAllByRole("button", { name: "Перейти" })[0]);

  expect(screen.getByLabelText("Текущий адрес").textContent).toBe(
    "/skill/offered-skill",
  );
  expect(
    store
      .getState()
      .notifications.items.filter((item) => item.userId === "sender")
      .every((item) => item.isRead),
  ).toBe(true);
  expect(
    store.getState().notifications.items.find((item) => item.id === "foreign")
      ?.isRead,
  ).toBe(false);
  expect(screen.queryByText("Новые уведомления")).toBeNull();
});
