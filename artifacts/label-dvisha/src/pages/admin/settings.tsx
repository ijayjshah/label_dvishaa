import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListSettings, getListSettingsQueryKey, useUpsertSetting } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useListSettings();
  const [pendingValues, setPendingValues] = useState<Record<string, string>>({});

  const upsertMutation = useUpsertSetting({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListSettingsQueryKey() });
        toast({ title: "Setting saved" });
      },
      onError: () => toast({ title: "Save failed", variant: "destructive" }),
    },
  });

  function getValue(key: string) {
    return pendingValues[key] ?? (settings?.find((s: any) => s.key === key)?.value ?? "");
  }

  function handleSave(key: string) {
    const value = pendingValues[key];
    if (value !== undefined) {
      upsertMutation.mutate({ key, data: { value } });
      setPendingValues(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  }

  const settingGroups = [
    {
      label: "Store Info",
      keys: [
        { key: "store_name", label: "Store Name" },
        { key: "store_tagline", label: "Tagline" },
        { key: "store_email", label: "Contact Email" },
        { key: "store_phone", label: "Contact Phone" },
      ],
    },
    {
      label: "Payment",
      keys: [
        { key: "razorpay_key_id", label: "Razorpay Key ID" },
        { key: "razorpay_key_secret", label: "Razorpay Key Secret (masked)", masked: true },
      ],
    },
    {
      label: "Media",
      keys: [
        { key: "cloudinary_cloud_name", label: "Cloudinary Cloud Name" },
        { key: "cloudinary_api_key", label: "Cloudinary API Key" },
        { key: "cloudinary_api_secret", label: "Cloudinary API Secret (masked)", masked: true },
      ],
    },
    {
      label: "Social",
      keys: [
        { key: "instagram_url", label: "Instagram URL" },
        { key: "facebook_url", label: "Facebook URL" },
        { key: "whatsapp_number", label: "WhatsApp Number" },
      ],
    },
  ];

  return (
    <AdminLayout title="Settings">
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-background border border-border p-5 h-40 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {settingGroups.map(group => (
            <div key={group.label} className="bg-background border border-border">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-serif text-lg">{group.label}</h2>
              </div>
              <div className="p-5 space-y-4">
                {group.keys.map(({ key, label, masked }) => (
                  <div key={key} className="flex items-end gap-3">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor={key}>{label}</Label>
                      <Input
                        id={key}
                        type={masked ? "password" : "text"}
                        value={getValue(key)}
                        onChange={e => setPendingValues(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={masked ? "••••••••" : ""}
                        data-testid={`input-${key}`}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="text-xs tracking-widest uppercase flex-shrink-0"
                      onClick={() => handleSave(key)}
                      disabled={upsertMutation.isPending || pendingValues[key] === undefined}
                      data-testid={`button-save-${key}`}
                    >
                      Save
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
