"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.gemini_api_key) {
          setMaskedKey(data.gemini_api_key);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "gemini_api_key", value: apiKey }),
    });

    setSaving(false);

    if (!res.ok) {
      toast.error("Failed to save API key");
      return;
    }

    setMaskedKey("••••" + apiKey.slice(-4));
    setApiKey("");
    toast.success("API key saved");
  };

  return (
    <div className="overflow-y-auto flex-1 min-h-0">
      <PageHeader
        title="Settings"
        description="Configure your application settings"
      />

      <div className="max-w-xl rounded-lg border bg-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-medium mb-1">Gemini AI</h3>
          <p className="text-sm text-muted-foreground">
            Enter your Google Gemini API key to enable AI-powered chat with student context.
          </p>
        </div>

        {maskedKey && (
          <p className="text-sm text-muted-foreground">
            Current key: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{maskedKey}</code>
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your Gemini API key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={saving || !apiKey.trim()}>
          {saving ? "Saving..." : "Save Key"}
        </Button>
      </div>

      <div className="max-w-xl rounded-lg border bg-card p-6 space-y-4 mt-6">
        <div>
          <h3 className="text-base font-medium mb-1">Data</h3>
          <p className="text-sm text-muted-foreground">
            Export all your data to a file, or import from a previous export to restore on another machine.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/api/export";
            }}
          >
            Export Data
          </Button>
          <Button
            variant="outline"
            disabled={importing}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".json";
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                if (!confirm("This will replace all existing data. Are you sure?")) return;

                setImporting(true);
                try {
                  const text = await file.text();
                  const data = JSON.parse(text);
                  const res = await fetch("/api/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });

                  if (!res.ok) {
                    const err = await res.json();
                    toast.error(err.error || "Failed to import data");
                  } else {
                    toast.success("Data imported successfully");
                  }
                } catch {
                  toast.error("Invalid file format");
                }
                setImporting(false);
              };
              input.click();
            }}
          >
            {importing ? "Importing..." : "Import Data"}
          </Button>
        </div>
      </div>
    </div>
  );
}
