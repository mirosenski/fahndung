"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const { data: investigations } = api.post.getInvestigations.useQuery({ limit: 1 });

  const utils = api.useUtils();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const createInvestigation = api.post.createInvestigation.useMutation({
    onSuccess: async () => {
      await utils.post.getInvestigations.invalidate();
      setTitle("");
      setDescription("");
    },
  });

  const latestInvestigation = investigations?.[0];

  return (
    <div className="w-full max-w-md">
      {latestInvestigation ? (
        <div className="mb-4 rounded-lg bg-white/10 p-4">
          <h3 className="font-semibold text-white">Neueste Fahndung:</h3>
          <p className="text-sm text-gray-300">{latestInvestigation.title}</p>
          {latestInvestigation.description && (
            <p className="mt-2 text-xs text-gray-400">{latestInvestigation.description}</p>
          )}
        </div>
      ) : (
        <p className="mb-4 text-gray-300">Noch keine Fahndungen vorhanden.</p>
      )}
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createInvestigation.mutate({ 
            title,
            description: description || undefined,
          });
        }}
        className="flex flex-col gap-3"
      >
        <input
          type="text"
          placeholder="Titel der Fahndung"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400"
        />
        <textarea
          placeholder="Beschreibung (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400"
          rows={3}
        />
        <button
          type="submit"
          className="rounded-lg bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
          disabled={createInvestigation.isPending || !title.trim()}
        >
          {createInvestigation.isPending ? "Erstelle..." : "Fahndung erstellen"}
        </button>
      </form>
    </div>
  );
}
