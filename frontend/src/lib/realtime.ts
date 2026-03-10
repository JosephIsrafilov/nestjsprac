import { useEffect, useEffectEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import type { RealtimeEvent, Task } from "../types";

export function useRealtimeSync(token: string | null) {
  const queryClient = useQueryClient();

  const invalidateTaskState = useEffectEvent((taskId?: number) => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });

    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ["task-activity", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
    }
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = io(window.location.origin, {
      path: "/socket.io",
      auth: { token },
    });

    socket.on("task.created", (event: RealtimeEvent<Task>) => {
      invalidateTaskState(event.payload.id);
    });

    socket.on("task.updated", (event: RealtimeEvent<Task>) => {
      invalidateTaskState(event.payload.id);
    });

    socket.on("task.deleted", (event: RealtimeEvent<{ id: number }>) => {
      invalidateTaskState(event.payload.id);
    });

    socket.on(
      "comment.created",
      (event: RealtimeEvent<{ taskId: number; comment: unknown }>) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({
          queryKey: ["task-comments", event.payload.taskId],
        });
      },
    );

    socket.on("tag.created", () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, token]);
}
