import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TaskItem } from "../TaskItem";
import type { Task } from "@/features/tasks/types";
import { dayjs } from "@/lib/dayjs";

const MOCK_TASK: Task = {
  id: "test-task-1",
  profileId: "test-profile-1",
  title: "Test Task",
  dueAt: dayjs().add(5, "months").format("YYYY-MM-DD"),
  estimatedMinutes: 100,
  completedAt: null,
  note: "Test note",
  createdAt: dayjs().subtract(20, "days").toISOString(),
};

describe("TaskItem", () => {
  describe("Basic rendering", () => {
    it("renders task title", () => {
      render(<TaskItem task={MOCK_TASK} />);
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });

    it("renders task note when provided", () => {
      render(<TaskItem task={MOCK_TASK} />);
      expect(screen.getByText("Test note")).toBeInTheDocument();
    });

    it("does not render note section when note is null", () => {
      const taskWithoutNote = { ...MOCK_TASK, note: null };
      render(<TaskItem task={taskWithoutNote} />);
      expect(screen.queryByText("Test note")).not.toBeInTheDocument();
    });

    it("renders due date in correct format", () => {
      render(<TaskItem task={MOCK_TASK} />);
      expect(screen.getByText(/期限:/)).toBeInTheDocument();
    });

    it("renders estimated minutes when provided", () => {
      render(<TaskItem task={MOCK_TASK} />);
      expect(screen.getByText(/見積: 100分/)).toBeInTheDocument();
    });

    it("renders created date", () => {
      render(<TaskItem task={MOCK_TASK} />);
      expect(screen.getByText(/作成:/)).toBeInTheDocument();
    });
  });

  describe("Completed task styling", () => {
    it("applies line-through style when task is completed", () => {
      const completedTask = {
        ...MOCK_TASK,
        completedAt: dayjs().subtract(10, "days").toISOString(),
      };
      render(<TaskItem task={completedTask} />);
      const title = screen.getByText("Test Task");
      expect(title).toHaveClass("line-through");
    });

    it("applies opacity style when task is completed", () => {
      const completedTask = {
        ...MOCK_TASK,
        completedAt: dayjs().subtract(10, "days").toISOString(),
      };
      const { container } = render(<TaskItem task={completedTask} />);
      const taskDiv = container.querySelector("div.opacity-60");
      expect(taskDiv).toBeInTheDocument();
    });
  });

  describe("Overdue task styling", () => {
    it("applies red border and background when task is overdue", () => {
      const overdueTask = {
        ...MOCK_TASK,
        dueAt: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
      };
      const { container } = render(<TaskItem task={overdueTask} />);
      const taskDiv = container.querySelector("div.border-red-300");
      expect(taskDiv).toBeInTheDocument();
    });

    it("displays overdue indicator in due date", () => {
      const overdueTask = {
        ...MOCK_TASK,
        dueAt: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
      };
      render(<TaskItem task={overdueTask} />);
      expect(screen.getByText(/(超過)/)).toBeInTheDocument();
    });

    it("does not show overdue for completed tasks even if past due", () => {
      const completedOverdueTask = {
        ...MOCK_TASK,
        dueAt: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
        completedAt: dayjs().subtract(6, "months").toISOString(),
      };
      const { container } = render(<TaskItem task={completedOverdueTask} />);
      const redBorder = container.querySelector("div.border-red-300");
      expect(redBorder).not.toBeInTheDocument();
    });
  });

  describe("actualMinutes prop and progress calculation", () => {
    it("does not render progress section when actualMinutes is 0", () => {
      render(<TaskItem task={MOCK_TASK} actualMinutes={0} />);
      expect(screen.queryByText(/実績:/)).not.toBeInTheDocument();
    });

    it("does not render progress section when actualMinutes is not provided", () => {
      render(<TaskItem task={MOCK_TASK} />);
      expect(screen.queryByText(/実績:/)).not.toBeInTheDocument();
    });

    it("renders actual minutes when provided and greater than 0", () => {
      render(<TaskItem task={MOCK_TASK} actualMinutes={50} />);
      expect(screen.getByText(/実績: 50分/)).toBeInTheDocument();
    });

    it("calculates progress correctly: 50% progress", () => {
      render(<TaskItem task={MOCK_TASK} actualMinutes={50} />);
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("calculates progress correctly: 75% progress", () => {
      render(<TaskItem task={MOCK_TASK} actualMinutes={75} />);
      expect(screen.getByText("75%")).toBeInTheDocument();
    });

    it("calculates progress correctly: 100% progress", () => {
      render(<TaskItem task={MOCK_TASK} actualMinutes={100} />);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("calculates progress correctly: over 100% progress", () => {
      render(<TaskItem task={MOCK_TASK} actualMinutes={150} />);
      expect(screen.getByText("150%")).toBeInTheDocument();
    });

    it("rounds progress to nearest integer", () => {
      render(<TaskItem task={MOCK_TASK} actualMinutes={33} />);
      // 33% progress
      expect(screen.getByText("33%")).toBeInTheDocument();
    });

    it("shows only actual minutes without progress bar when estimatedMinutes is null", () => {
      const taskWithoutEstimate = { ...MOCK_TASK, estimatedMinutes: null };
      render(<TaskItem task={taskWithoutEstimate} actualMinutes={50} />);
      expect(screen.getByText(/実績: 50分/)).toBeInTheDocument();
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });

    it("shows only actual minutes without progress bar when estimatedMinutes is 0", () => {
      const taskWithZeroEstimate = { ...MOCK_TASK, estimatedMinutes: 0 };
      render(<TaskItem task={taskWithZeroEstimate} actualMinutes={50} />);
      expect(screen.getByText(/実績: 50分/)).toBeInTheDocument();
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });
  });

  describe("Progress color coding", () => {
    it("applies gray color for progress < 50%", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={30} />
      );
      const progressText = screen.getByText("30%");
      expect(progressText).toHaveClass("text-gray-600");

      const progressBar = container.querySelector(".bg-gray-400");
      expect(progressBar).toBeInTheDocument();
    });

    it("applies orange color for progress >= 50% and < 75%", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={60} />
      );
      const progressText = screen.getByText("60%");
      expect(progressText).toHaveClass("text-orange-600");

      const progressBar = container.querySelector(".bg-orange-500");
      expect(progressBar).toBeInTheDocument();
    });

    it("applies blue color for progress >= 75% and < 100%", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={80} />
      );
      const progressText = screen.getByText("80%");
      expect(progressText).toHaveClass("text-blue-600");

      const progressBar = container.querySelector(".bg-blue-500");
      expect(progressBar).toBeInTheDocument();
    });

    it("applies green color for progress >= 100%", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={100} />
      );
      const progressText = screen.getByText("100%");
      expect(progressText).toHaveClass("text-green-600");

      const progressBar = container.querySelector(".bg-green-500");
      expect(progressBar).toBeInTheDocument();
    });

    it("applies green color for progress > 100%", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={120} />
      );
      const progressText = screen.getByText("120%");
      expect(progressText).toHaveClass("text-green-600");

      const progressBar = container.querySelector(".bg-green-500");
      expect(progressBar).toBeInTheDocument();
    });

    it("applies correct color at exactly 50% boundary", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={50} />
      );
      const progressText = screen.getByText("50%");
      expect(progressText).toHaveClass("text-orange-600");

      const progressBar = container.querySelector(".bg-orange-500");
      expect(progressBar).toBeInTheDocument();
    });

    it("applies correct color at exactly 75% boundary", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={75} />
      );
      const progressText = screen.getByText("75%");
      expect(progressText).toHaveClass("text-blue-600");

      const progressBar = container.querySelector(".bg-blue-500");
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe("Progress bar rendering", () => {
    it("renders progress bar container", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={50} />
      );
      const progressContainer = container.querySelector(".bg-gray-200");
      expect(progressContainer).toBeInTheDocument();
    });

    it("progress bar width matches progress percentage", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={60} />
      );
      const progressBar = container.querySelector(".bg-orange-500");
      expect(progressBar).toHaveStyle({ width: "60%" });
    });

    it("progress bar width capped at 100% when progress exceeds 100%", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={150} />
      );
      const progressBar = container.querySelector(".bg-green-500");
      expect(progressBar).toHaveStyle({ width: "100%" });
    });

    it("progress bar has smooth transition", () => {
      const { container } = render(
        <TaskItem task={MOCK_TASK} actualMinutes={50} />
      );
      const progressBar = container.querySelector(".transition-all");
      expect(progressBar).toBeInTheDocument();
    });

    it("renders progress label with actual and estimated minutes", () => {
      render(<TaskItem task={MOCK_TASK} actualMinutes={60} />);
      expect(
        screen.getByText(/実績: 60分 \/ 100分/)
      ).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles task with no due date", () => {
      const taskNoDue = { ...MOCK_TASK, dueAt: null };
      render(<TaskItem task={taskNoDue} />);
      expect(screen.queryByText(/期限:/)).not.toBeInTheDocument();
    });

    it("handles task with no estimated minutes", () => {
      const taskNoEstimate = { ...MOCK_TASK, estimatedMinutes: null };
      render(<TaskItem task={taskNoEstimate} />);
      expect(screen.queryByText(/見積:/)).not.toBeInTheDocument();
    });

    it("handles very large actual minutes value", () => {
      render(<TaskItem task={MOCK_TASK} actualMinutes={10000} />);
      expect(screen.getByText(/実績: 10000分/)).toBeInTheDocument();
    });

    it("handles progress calculation with very small estimated minutes", () => {
      const taskSmallEstimate = { ...MOCK_TASK, estimatedMinutes: 1 };
      render(<TaskItem task={taskSmallEstimate} actualMinutes={1} />);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });
});
