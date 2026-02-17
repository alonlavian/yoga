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
    <div>
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
    </div>
  );
}
