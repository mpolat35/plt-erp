"use client";

import React, { useState, useEffect, useRef, useContext, createContext } from "react";
import {
  Mail, MessageSquare, Bell, ChevronDown, Plus,
  Edit2, RotateCcw, List, FileText, BarChart2,
  User, Zap, Clock, CheckCircle2, XCircle, Trash2,
} from "lucide-react";
import clsx from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { IconButton, IconButtonRow } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { StatCard } from "@/components/ui/StatCard";

// ── Types ─────────────────────────────────────────────────────────────────────
interface EventField {
  key: string; label: string; type: "enum" | "number" | "date";
  values?: string[];
}
interface CatalogEvent {
  id: string; label: string; description: string;
  cancelEvents: string[]; fields: EventField[];
}
interface EventGroup { group: string; events: CatalogEvent[]; }

interface Condition { field: string; op: string; value: string; logic?: "AND" | "OR"; }
interface RetryConfig { enabled: boolean; count: number; intervalHours: number; }
interface Escalation {
  level: number; label: string;
  delayAmount: number; delayUnit: "minutes" | "hours" | "days"; delayFrom: "event" | "previous";
  conditions: Condition[];
  channels: string[];
  channelTemplates: Record<string, string>;
  retry: RetryConfig;
}
interface Rule {
  id: string; name: string; eventType: string; cancelOn: string;
  priority: number; sendWindow: { start: string; end: string };
  active: boolean; escalations: Escalation[];
}
interface Template { id: string; name: string; channel: "email" | "sms" | "push"; subject: string; body: string; }
interface LogEntry { id: string; ts: string; recipient: string; rule: string; level: number; channel: string; status: "delivered" | "failed" | "pending"; }
interface Pref { id: string; name: string; email: boolean; sms: boolean; push: boolean; optOut: boolean; }

// ── Olay Kataloğu ─────────────────────────────────────────────────────────────
const EVENT_CATALOG: EventGroup[] = [
  {
    group: "Ödeme",
    events: [
      { id: "payment.overdue", label: "Ödeme Gecikmesi", description: "Fatura/ödeme vadesi geçtiğinde tetiklenir", cancelEvents: ["payment.completed", "payment.cancelled"], fields: [{ key: "payment_status", label: "Ödeme Durumu", type: "enum", values: ["overdue", "pending", "failed", "disputed"] }, { key: "overdue_days", label: "Gecikme (gün)", type: "number" }, { key: "amount", label: "Tutar (TL)", type: "number" }, { key: "invoice_type", label: "Fatura Tipi", type: "enum", values: ["electricity", "water", "gas", "internet", "subscription"] }, { key: "customer_segment", label: "Müşteri Segmenti", type: "enum", values: ["individual", "business", "vip"] }] },
      { id: "payment.completed", label: "Ödeme Tamamlandı", description: "Başarılı ödeme yapıldığında tetiklenir", cancelEvents: [], fields: [{ key: "payment_method", label: "Ödeme Yöntemi", type: "enum", values: ["credit_card", "bank_transfer", "cash", "online"] }, { key: "amount", label: "Tutar (TL)", type: "number" }] },
      { id: "payment.failed", label: "Ödeme Başarısız", description: "Ödeme işlemi başarısız olduğunda", cancelEvents: ["payment.completed"], fields: [{ key: "failure_reason", label: "Başarısızlık Sebebi", type: "enum", values: ["insufficient_funds", "card_expired", "fraud_detected", "bank_error"] }, { key: "attempt_count", label: "Deneme Sayısı", type: "number" }, { key: "amount", label: "Tutar (TL)", type: "number" }] },
    ],
  },
  {
    group: "Sözleşme",
    events: [
      { id: "contract.expiring", label: "Sözleşme Sona Eriyor", description: "Sözleşme bitiş tarihine yaklaşıldığında", cancelEvents: ["contract.renewed", "contract.cancelled"], fields: [{ key: "contract_status", label: "Sözleşme Durumu", type: "enum", values: ["expiring", "expired", "active"] }, { key: "days_remaining", label: "Kalan Gün", type: "number" }, { key: "contract_type", label: "Sözleşme Tipi", type: "enum", values: ["annual", "monthly", "bi_annual"] }, { key: "auto_renewal", label: "Otomatik Yenileme", type: "enum", values: ["enabled", "disabled"] }] },
      { id: "contract.renewed", label: "Sözleşme Yenilendi", description: "Sözleşme başarıyla yenilendiğinde", cancelEvents: [], fields: [{ key: "new_end_date", label: "Yeni Bitiş Tarihi", type: "date" }, { key: "contract_type", label: "Sözleşme Tipi", type: "enum", values: ["annual", "monthly", "bi_annual"] }] },
    ],
  },
  {
    group: "Sipariş",
    events: [
      { id: "order.status_changed", label: "Sipariş Durumu Değişti", description: "Sipariş durumu güncellendiğinde anlık bildirim", cancelEvents: [], fields: [{ key: "order_status", label: "Sipariş Durumu", type: "enum", values: ["confirmed", "preparing", "shipped", "delivered", "cancelled", "returned"] }, { key: "carrier", label: "Kargo Firması", type: "enum", values: ["yurtici", "aras", "mng", "ptt", "ups"] }, { key: "order_value", label: "Sipariş Değeri", type: "number" }] },
      { id: "order.delivery_failed", label: "Teslimat Başarısız", description: "Kargo teslim edilemediğinde", cancelEvents: ["order.status_changed"], fields: [{ key: "attempt_count", label: "Deneme Sayısı", type: "number" }, { key: "failure_reason", label: "Sebep", type: "enum", values: ["not_at_home", "address_wrong", "refused", "other"] }] },
    ],
  },
  {
    group: "Kullanıcı",
    events: [
      { id: "user.inactive", label: "Kullanıcı Hareketsiz", description: "Belirli süredir giriş yapılmamışsa", cancelEvents: ["user.login"], fields: [{ key: "inactive_days", label: "Hareketsizlik (gün)", type: "number" }, { key: "account_type", label: "Hesap Tipi", type: "enum", values: ["free", "premium", "enterprise"] }, { key: "last_action", label: "Son Eylem", type: "enum", values: ["purchase", "login", "profile_update", "support_ticket"] }] },
      { id: "user.subscription_expiring", label: "Abonelik Sona Eriyor", description: "Kullanıcı aboneliği bitiş tarihine yaklaşıyor", cancelEvents: ["user.subscription_renewed"], fields: [{ key: "plan_name", label: "Plan Adı", type: "enum", values: ["basic", "pro", "enterprise"] }, { key: "days_remaining", label: "Kalan Gün", type: "number" }, { key: "billing_cycle", label: "Fatura Dönemi", type: "enum", values: ["monthly", "annual"] }] },
    ],
  },
];

const getEventFromCatalog = (catalog: EventGroup[], id: string) =>
  catalog.flatMap(g => g.events).find(e => e.id === id);
const getFieldsFromCatalog = (catalog: EventGroup[], eventId: string) =>
  getEventFromCatalog(catalog, eventId)?.fields || [];

interface CatalogCtxValue {
  catalog: EventGroup[];
  setCatalog: React.Dispatch<React.SetStateAction<EventGroup[]>>;
}
const CatalogContext = createContext<CatalogCtxValue | null>(null);
const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogContext.Provider");
  return ctx;
};

const SEED_RULES: Rule[] = [
  { id: "r1", name: "Fatura Ödeme Gecikmesi", eventType: "payment.overdue", cancelOn: "payment.completed", priority: 1, sendWindow: { start: "08:00", end: "21:00" }, active: true, escalations: [{ level: 1, label: "Bilgilendirme", delayAmount: 1, delayUnit: "days", delayFrom: "event", conditions: [{ field: "payment_status", op: "==", value: "overdue" }], channels: ["email", "sms"], channelTemplates: { email: "t1", sms: "t3" }, retry: { enabled: true, count: 2, intervalHours: 4 } }, { level: 2, label: "İhtar", delayAmount: 7, delayUnit: "days", delayFrom: "event", conditions: [{ field: "payment_status", op: "==", value: "overdue" }, { field: "overdue_days", op: ">=", value: "7", logic: "AND" }], channels: ["email", "sms"], channelTemplates: { email: "t2", sms: "t3" }, retry: { enabled: true, count: 3, intervalHours: 6 } }, { level: 3, label: "Kesme Bildirimi", delayAmount: 14, delayUnit: "days", delayFrom: "event", conditions: [{ field: "payment_status", op: "==", value: "overdue" }], channels: ["email", "sms", "push"], channelTemplates: { email: "t2", sms: "t3", push: "t6" }, retry: { enabled: false, count: 1, intervalHours: 24 } }] },
  { id: "r2", name: "Sözleşme Yenileme", eventType: "contract.expiring", cancelOn: "contract.renewed", priority: 2, sendWindow: { start: "09:00", end: "18:00" }, active: true, escalations: [{ level: 1, label: "Hatırlatma", delayAmount: 30, delayUnit: "days", delayFrom: "event", conditions: [{ field: "contract_status", op: "==", value: "expiring" }], channels: ["email"], channelTemplates: { email: "t4" }, retry: { enabled: true, count: 1, intervalHours: 48 } }, { level: 2, label: "Son Uyarı", delayAmount: 7, delayUnit: "days", delayFrom: "event", conditions: [{ field: "contract_status", op: "==", value: "expiring" }, { field: "days_remaining", op: "<=", value: "7", logic: "AND" }], channels: ["email", "sms"], channelTemplates: { email: "t4", sms: "t5" }, retry: { enabled: true, count: 2, intervalHours: 24 } }] },
];

const SEED_TEMPLATES: Template[] = [
  { id: "t1", name: "Fatura Hatırlatma", channel: "email", subject: "Faturanızın ödeme tarihi yaklaşıyor", body: "Sayın {{musteri_adi}},\n\n{{tutar}} TL tutarındaki faturanızın son ödeme tarihi {{son_odeme_tarihi}} tarihidir.\n\nÖdemenizi gerçekleştirmek için hesabınıza giriş yapabilirsiniz." },
  { id: "t2", name: "Gecikme İhtar", channel: "email", subject: "Önemli: Gecikmiş fatura bildirimi", body: "Sayın {{musteri_adi}},\n\n{{gecikme_gun}} gündür ödenmemiş {{tutar}} TL tutarındaki faturanız için resmi ihtar sürecimiz başlamıştır." },
  { id: "t3", name: "Fatura SMS", channel: "sms", subject: "", body: "{{musteri_adi}}, {{tutar}} TL faturanız {{gecikme_gun}} gündür ödenmedi. 48 saat içinde ödeme yapılmazsa hizmetiniz durdurulacaktır." },
  { id: "t4", name: "Sözleşme Hatırlatma", channel: "email", subject: "Sözleşmeniz {{kalan_gun}} gün içinde sona eriyor", body: "Sayın {{musteri_adi}},\n\n{{sozlesme_adi}} sözleşmeniz {{bitis_tarihi}} tarihinde sona ermektedir." },
  { id: "t5", name: "Son Yenileme Uyarısı", channel: "sms", subject: "", body: "{{musteri_adi}}, {{sozlesme_adi}} sözleşmeniz {{kalan_gun}} gün içinde sona eriyor. Yenileme için arayın: 0850 XXX XX XX" },
  { id: "t6", name: "Sipariş Güncelleme", channel: "push", subject: "Siparişiniz güncellendi", body: "{{siparis_no}} numaralı siparişiniz {{yeni_durum}} durumuna geçti." },
];

const SEED_LOGS: LogEntry[] = [
  { id: "l1", ts: "2024-03-15 09:12", recipient: "Ahmet Yılmaz", rule: "Fatura Ödeme Gecikmesi", level: 1, channel: "email", status: "delivered" },
  { id: "l2", ts: "2024-03-15 09:12", recipient: "Ahmet Yılmaz", rule: "Fatura Ödeme Gecikmesi", level: 1, channel: "sms", status: "delivered" },
  { id: "l3", ts: "2024-03-14 14:30", recipient: "Zeynep Kaya", rule: "Sözleşme Yenileme", level: 1, channel: "email", status: "delivered" },
  { id: "l4", ts: "2024-03-14 10:05", recipient: "Murat Demir", rule: "Fatura Ödeme Gecikmesi", level: 2, channel: "email", status: "failed" },
  { id: "l5", ts: "2024-03-14 10:05", recipient: "Murat Demir", rule: "Fatura Ödeme Gecikmesi", level: 2, channel: "sms", status: "delivered" },
  { id: "l6", ts: "2024-03-13 08:00", recipient: "Elif Şahin", rule: "Fatura Ödeme Gecikmesi", level: 3, channel: "email", status: "delivered" },
  { id: "l7", ts: "2024-03-13 08:00", recipient: "Elif Şahin", rule: "Fatura Ödeme Gecikmesi", level: 3, channel: "sms", status: "delivered" },
  { id: "l8", ts: "2024-03-12 16:45", recipient: "Can Öztürk", rule: "Sipariş Durumu", level: 1, channel: "push", status: "delivered" },
];

const SEED_PREFS: Pref[] = [
  { id: "p1", name: "Ahmet Yılmaz", email: true,  sms: true,  push: false, optOut: false },
  { id: "p2", name: "Zeynep Kaya",  email: true,  sms: false, push: true,  optOut: false },
  { id: "p3", name: "Murat Demir",  email: false, sms: true,  push: false, optOut: false },
  { id: "p4", name: "Elif Şahin",   email: true,  sms: true,  push: true,  optOut: false },
  { id: "p5", name: "Can Öztürk",   email: true,  sms: false, push: false, optOut: true },
];

const DELAY_UNIT_LABELS: Record<string, string> = { minutes: "dk", hours: "sa", days: "gün" };
const OPS_FOR_TYPE: Record<string, { v: string; l: string }[]> = {
  enum:   [{ v: "==", l: "eşittir" }, { v: "!=", l: "eşit değil" }],
  number: [{ v: "==", l: "=" }, { v: "!=", l: "≠" }, { v: ">", l: ">" }, { v: ">=", l: "≥" }, { v: "<", l: "<" }, { v: "<=", l: "≤" }],
  date:   [{ v: "before", l: "önce" }, { v: "after", l: "sonra" }],
};
const getOpsForField = (field?: EventField) => OPS_FOR_TYPE[field?.type ?? "enum"] || OPS_FOR_TYPE.enum;

const CHANNEL_META: Record<string, { label: string; icon: typeof Mail }> = {
  email: { label: "E-posta", icon: Mail },
  sms:   { label: "SMS",     icon: MessageSquare },
  push:  { label: "Push",    icon: Bell },
};

const LEVEL_BADGE: Record<number, "emerald" | "amber" | "red"> = { 1: "emerald", 2: "amber", 3: "red" };
const LEVEL_LABEL: Record<number, string> = { 1: "Bilgilendirme", 2: "İhtar", 3: "Kritik" };

let nextId = 100;
const uid = (p: string) => `${p}${++nextId}`;

// ── Koşul Oluşturucu ──────────────────────────────────────────────────────────
function ConditionBuilder({ conditions, onChange, eventId }: {
  conditions: Condition[]; onChange: (c: Condition[]) => void; eventId: string;
}) {
  const { catalog } = useCatalog();
  const fields = getFieldsFromCatalog(catalog, eventId);

  const addCondition = () => {
    if (!fields.length) return;
    const f = fields[0];
    const op = getOpsForField(f)[0].v;
    const val = f.type === "enum" ? (f.values?.[0] ?? "") : "";
    const logic: "AND" | "OR" = "AND";
    onChange([...conditions, { field: f.key, op, value: val, logic }]);
  };

  const remove = (i: number) => onChange(conditions.filter((_, idx) => idx !== i));

  const update = (i: number, cond: Condition) => onChange(conditions.map((c, idx) => idx === i ? cond : c));

  return (
    <div className="flex flex-col gap-2">
      {conditions.map((cond, idx) => {
        const fieldDef = fields.find(f => f.key === cond.field);
        const ops = getOpsForField(fieldDef);
        return (
          <div key={idx} className="flex items-center gap-2 flex-wrap">
            {idx > 0 && (
            <Select
                value={cond.logic || "AND"}
                onChange={e => update(idx, { ...cond, logic: e.target.value as "AND" | "OR" })}
                options={[
                  { label: "VE", value: "AND" },
                  { label: "VEYA", value: "OR" },
                ]}
                className="!w-16"
              />
            )}
            <Select
              value={cond.field}
              onChange={e => {
                const newF = fields.find(f => f.key === e.target.value);
                update(idx, { ...cond, field: e.target.value, op: getOpsForField(newF)[0].v, value: newF?.type === "enum" ? (newF.values?.[0] ?? "") : "" });
              }}
              options={fields.map(f => ({ label: f.label, value: f.key }))}
              className="flex-1 min-w-0"
            />
            <Select
              value={cond.op}
              onChange={e => update(idx, { ...cond, op: e.target.value })}
              options={ops.map(o => ({ label: o.l, value: o.v }))}
              className="!w-24 shrink-0"
            />
            {fieldDef?.type === "enum" ? (
              <Select
                value={cond.value}
                onChange={e => update(idx, { ...cond, value: e.target.value })}
                options={fieldDef.values?.map(v => ({ label: v, value: v })) || []}
                className="flex-1 min-w-0"
              />
            ) : (
              <Input
                value={cond.value}
                onChange={e => update(idx, { ...cond, value: e.target.value })}
                placeholder="değer..."
                className="flex-1 min-w-0"
              />
            )}
            <IconButton
              variant="delete"
              icon={<XCircle className="w-3.5 h-3.5" />}
              onClick={() => remove(idx)}
              title="Kaldır"
            />
          </div>
        );
      })}
      {conditions.length > 0 && (
        <div className="px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400 font-mono">
          {conditions.map((c, i) => {
            const fDef = fields.find(f => f.key === c.field);
            return (
              <span key={i}>
                {i > 0 && <strong className="font-sans text-blue-600 dark:text-blue-400 mx-1">{c.logic}</strong>}
                {fDef?.label || c.field} {c.op} "{c.value}"
              </span>
            );
          })}
        </div>
      )}
      {fields.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          iconLeft={<Plus className="w-4 h-4" />}
          onClick={addCondition}
          className="w-fit border-dashed border-blue-200 dark:border-blue-800 h-9"
        >
          Koşul ekle
        </Button>
      )}
      {!fields.length && (
        <p className="text-xs text-slate-400 italic">Koşul tanımlamak için önce tetikleyen olayı seçin.</p>
      )}
    </div>
  );
}

// ── EventPicker ───────────────────────────────────────────────────────────────
function EventPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { catalog } = useCatalog();
  const [open, setOpen] = useState(false);
  const selected = getEventFromCatalog(catalog, value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className={clsx(
          "w-full justify-between h-10 px-3 bg-white dark:bg-slate-800 transition-all",
          open ? "border-blue-400 ring-1 ring-blue-400" : "border-slate-200 dark:border-slate-700",
          !selected && "text-slate-400"
        )}
        iconRight={<ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", open && "rotate-180")} />}
      >
        <span className="truncate">
          {selected ? (
            <span className="flex items-center gap-2">
              <code className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded font-mono">{value}</code>
              <span className="font-semibold">{selected.label}</span>
            </span>
          ) : "Olay seç..."}
        </span>
      </Button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {catalog.map(group => (
            <div key={group.group}>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50 rounded-lg mb-1">
                {group.group}
              </div>
              <div className="grid gap-0.5 mb-2">
                {group.events.map(e => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => { onChange(e.id); setOpen(false); }}
                    className={clsx(
                      "w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-all",
                      value === e.id
                        ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{e.label}</div>
                      <code className="text-[10px] opacity-50 block truncate font-mono">{e.id}</code>
                    </div>
                    <CheckCircle2 className={clsx("w-4 h-4 text-blue-500 opacity-0 transition-opacity", value === e.id && "opacity-100")} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Eskalasyon Satırı ─────────────────────────────────────────────────────────
function EscalationRow({ esc, isLast, templates, eventId, onUpdate, onDelete }: {
  esc: Escalation; isLast: boolean; templates: Template[];
  eventId: string; onUpdate: (u: Escalation) => void; onDelete: () => void;
}) {
  const { catalog } = useCatalog();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Escalation>({ ...esc, conditions: esc.conditions || [] });

  const startEditing = () => { setDraft({ ...esc, conditions: esc.conditions || [] }); setEditing(true); };
  const save = () => { onUpdate(draft); setEditing(false); };
  const cancel = () => { setDraft({ ...esc, conditions: esc.conditions || [] }); setEditing(false); };

  const toggleChannel = (ch: string) => {
    const chs = draft.channels.includes(ch)
      ? draft.channels.filter(c => c !== ch)
      : [...draft.channels, ch];
    const tpls = { ...draft.channelTemplates };
    if (!chs.includes(ch)) delete tpls[ch];
    setDraft({ ...draft, channels: chs, channelTemplates: tpls });
  };

  const levelBadge = LEVEL_BADGE[Math.min(esc.level, 3) as 1 | 2 | 3];

  return (
    <div className="flex gap-0">
      {/* Timeline */}
      <div className="w-10 flex flex-col items-center flex-shrink-0">
        <div className={clsx(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2",
          levelBadge === "emerald" && "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400",
          levelBadge === "amber"   && "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-400",
          levelBadge === "red"     && "bg-red-50 border-red-300 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-400",
        )}>{esc.level}</div>
        {!isLast && <div className="w-0.5 flex-1 min-h-6 bg-slate-200 dark:bg-slate-700 my-1" />}
      </div>

      {/* Content */}
      <div className={clsx("flex-1 ml-3", !isLast && "pb-4")}>
        {!editing ? (
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{esc.label}</span>
              <Badge variant={levelBadge} size="sm">
                {esc.delayAmount === 0 ? "Anlık" : `+${esc.delayAmount} ${DELAY_UNIT_LABELS[esc.delayUnit]} (${esc.delayFrom === "previous" ? "önceki seviyeden" : "olaydan"})`}
              </Badge>
            </div>
            {esc.conditions?.length > 0 && (
              <div className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400 mb-2 font-mono">
                {esc.conditions.map((c, i) => {
                  const fDef = getFieldsFromCatalog(catalog, eventId).find(f => f.key === c.field);
                  return (
                    <span key={i}>
                      {i > 0 && <strong className="font-sans text-blue-600 mx-1">{c.logic}</strong>}
                      {fDef?.label || c.field} {c.op} "{c.value}"
                    </span>
                  );
                })}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {esc.channels.map(ch => {
                const tplName = templates.find(t => t.id === esc.channelTemplates?.[ch])?.name;
                const ChIcon = CHANNEL_META[ch]?.icon || Bell;
                return (
                  <span key={ch} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                    <ChIcon className="w-3 h-3" />
                    {CHANNEL_META[ch]?.label || ch}
                    {tplName && <span className="text-slate-400"> → {tplName}</span>}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <RotateCcw className="w-3 h-3" />
                {esc.retry.enabled ? `${esc.retry.count}x, ${esc.retry.intervalHours}sa arayla` : "Tekrar yok"}
              </span>
              <div className="flex-1" />
              <IconButtonRow>
                <IconButton
                  variant="edit"
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={startEditing}
                  title="Düzenle"
                />
                <IconButton
                  variant="delete"
                  icon={<XCircle className="w-3.5 h-3.5" />}
                  onClick={onDelete}
                  title="Sil"
                />
              </IconButtonRow>
            </div>
          </div>
        ) : (
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">KADEME ADI</p>
                <Input
                  value={draft.label}
                  onChange={e => setDraft({ ...draft, label: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 px-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GECİKME SÜRESİ</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={draft.delayAmount}
                    onChange={e => setDraft({ ...draft, delayAmount: +e.target.value })}
                    className="!w-20 shrink-0"
                  />
                  <Select
                    value={draft.delayUnit}
                    onChange={e => setDraft({ ...draft, delayUnit: e.target.value as Escalation["delayUnit"] })}
                    options={[
                      { label: "Dakika", value: "minutes" },
                      { label: "Saat", value: "hours" },
                      { label: "Gün", value: "days" },
                    ]}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">BAŞLANGIÇ</p>
                <Select
                  value={draft.delayFrom}
                  onChange={e => setDraft({ ...draft, delayFrom: e.target.value as Escalation["delayFrom"] })}
                  options={[
                    { label: "Olay Zamanı", value: "event" },
                    { label: "Önceki Kademe", value: "previous" },
                  ]}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">KOŞULLAR</p>
              <ConditionBuilder conditions={draft.conditions} onChange={c => setDraft({ ...draft, conditions: c })} eventId={eventId} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">KANALLAR & ŞABLONLAR</p>
              <div className="flex flex-col gap-2">
                {["email", "sms", "push"].map(ch => {
                  const active = draft.channels.includes(ch);
                  const ChIcon = CHANNEL_META[ch]?.icon || Bell;
                  return (
                    <div key={ch} className={clsx(
                      "flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors",
                      active ? "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-700" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 opacity-60"
                    )}>
                      <Toggle checked={active} onChange={() => toggleChannel(ch)} size="sm" />
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 w-20">
                        <ChIcon className="w-3.5 h-3.5" />
                        {CHANNEL_META[ch]?.label || ch}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Select
                          value={draft.channelTemplates?.[ch] || ""}
                          onChange={e => setDraft({ ...draft, channelTemplates: { ...draft.channelTemplates, [ch]: e.target.value } })}
                          options={[
                            { label: "-- Şablon seç --", value: "" },
                            ...templates.filter(t => t.channel === ch).map(t => ({ label: t.name, value: t.id }))
                          ]}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">YENİDEN DENEME</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Toggle checked={draft.retry.enabled} onChange={v => setDraft({ ...draft, retry: { ...draft.retry, enabled: v } })} label="Aktif" size="sm" />
                {draft.retry.enabled && (
                  <>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Yenileme:</span>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={draft.retry.count}
                        onChange={e => setDraft({ ...draft, retry: { ...draft.retry, count: +e.target.value } })}
                        className="!w-16"
                      />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Aralık (sa):</span>
                      <Input
                        type="number"
                        min="1"
                        value={draft.retry.intervalHours}
                        onChange={e => setDraft({ ...draft, retry: { ...draft.retry, intervalHours: +e.target.value } })}
                        className="!w-20"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={save}>Kaydet</Button>
              <Button size="sm" variant="outline" onClick={cancel}>İptal</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Kural Formu ───────────────────────────────────────────────────────────────
function RuleForm({ initial, templates, title = "Yeni Kural", onSave, onCancel }: {
  initial?: Rule; templates: Template[];
  title?: string; onSave: (r: Omit<Rule, "id">) => void; onCancel: () => void;
}) {
  const defaultEsc: Escalation = {
    level: 1, label: "Bilgilendirme", delayAmount: 1, delayUnit: "days", delayFrom: "event",
    conditions: [], channels: ["email"], channelTemplates: {}, retry: { enabled: false, count: 1, intervalHours: 24 },
  };

  const { catalog } = useCatalog();
  const [rule, setRule] = useState<Omit<Rule, "id">>(initial ?? {
    name: "", eventType: "", cancelOn: "", priority: 3,
    sendWindow: { start: "08:00", end: "21:00" }, active: true, escalations: [defaultEsc],
  });

  const selectedEvent = getEventFromCatalog(catalog, rule.eventType);
  const cancelOptions = selectedEvent?.cancelEvents || [];

  const updateEsc = (level: number, updated: Escalation) =>
    setRule({ ...rule, escalations: rule.escalations.map(e => e.level === level ? updated : e) });

  const deleteEsc = (level: number) =>
    setRule({ ...rule, escalations: rule.escalations.filter(e => e.level !== level) });

  const addLevel = () => {
    const nextLevel = rule.escalations.length + 1;
    setRule({ ...rule, escalations: [...rule.escalations, { ...defaultEsc, level: nextLevel, label: `Seviye ${nextLevel}` }] });
  };

  const canSave = rule.name.trim() && rule.eventType;

  return (
    <div className="border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-blue-700 dark:bg-blue-900 flex items-center justify-between">
        <span className="font-bold text-base text-white flex items-center gap-2.5">
          <Zap className="w-5 h-5" /> {title}
        </span>
        <button onClick={onCancel} className="text-white/60 hover:text-white transition-colors duration-200">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 space-y-4">
        {/* Temel Bilgiler */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kural Bilgileri</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">KURAL ADI <span className="text-red-500">*</span></p>
              <Input
                placeholder="ör. Fatura Gecikmesi"
                value={rule.name}
                onChange={e => setRule({ ...rule, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">ÖNCELİK</p>
              <Select
                value={String(rule.priority)}
                onChange={e => setRule({ ...rule, priority: +e.target.value })}
                options={[1, 2, 3, 4, 5].map(p => ({
                  label: `Öncelik ${p}${p === 1 ? " (En yüksek)" : p === 5 ? " (En düşük)" : ""}`,
                  value: String(p)
                }))}
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">TETİKLEYEN OLAY <span className="text-red-500">*</span></p>
            <EventPicker value={rule.eventType} onChange={v => setRule({ ...rule, eventType: v, escalations: rule.escalations.map(e => ({ ...e, conditions: [] })) })} />
            {selectedEvent && (
              <div className="mt-1.5 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                {selectedEvent.description} · {selectedEvent.fields.length} alan mevcut
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">İPTAL OLAYI</p>
            {cancelOptions.length > 0 ? (
              <Select
                value={rule.cancelOn}
                onChange={e => setRule({ ...rule, cancelOn: e.target.value })}
                options={[
                  { label: "-- İptal olayı yok --", value: "" },
                  ...cancelOptions.map(c => ({
                    label: `${getEventFromCatalog(catalog, c)?.label || c} (${c})`,
                    value: c
                  }))
                ]}
              />
            ) : (
              <Input
                placeholder={rule.eventType ? "Elle yazın..." : "Önce tetikleyen olayı seçin"}
                value={rule.cancelOn}
                onChange={e => setRule({ ...rule, cancelOn: e.target.value })}
                disabled={!rule.eventType}
              />
            )}
            {rule.cancelOn && (
              <p className="mt-1 text-[11px] text-slate-400 italic pl-1">
                <code className="bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 px-1.5 py-0.5 rounded text-slate-600 font-mono">{rule.cancelOn}</code> olayı geldiğinde tüm bekleyen bildirimler iptal edilir.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">GÖNDERİM PENCERESİ</p>
            <div className="flex items-center gap-3">
              <Input
                type="time"
                value={rule.sendWindow.start}
                onChange={e => setRule({ ...rule, sendWindow: { ...rule.sendWindow, start: e.target.value } })}
                className="!w-32"
              />
              <span className="text-slate-400">–</span>
              <Input
                type="time"
                value={rule.sendWindow.end}
                onChange={e => setRule({ ...rule, sendWindow: { ...rule.sendWindow, end: e.target.value } })}
                className="!w-32"
              />
              <span className="text-xs text-slate-400 italic">arası gönderilir</span>
            </div>
          </div>
        </div>

        {/* Eskalasyon Seviyeleri */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Eskalasyon Seviyeleri</p>
            <span className="text-xs text-slate-400">{rule.escalations.length} seviye</span>
          </div>
          {!rule.eventType && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
              Tetikleyen olayı seçtikten sonra seviyelerde koşul tanımlayabilirsiniz.
            </div>
          )}
          <div className="flex flex-col">
            {rule.escalations.map((esc, i) => (
              <EscalationRow key={esc.level} esc={esc} isLast={i === rule.escalations.length - 1}
                templates={templates} eventId={rule.eventType}
                onUpdate={u => updateEsc(esc.level, u)} onDelete={() => deleteEsc(esc.level)} />
            ))}
          </div>
          <Button
            variant="outline"
            iconLeft={<Plus className="w-4 h-4" />}
            onClick={addLevel}
            className="mt-4 w-full border-dashed border-slate-300 dark:border-slate-700 h-10"
          >
            Seviye ekle
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => canSave && onSave(rule)} disabled={!canSave}>Kaydet</Button>
          <Button variant="outline" onClick={onCancel}>İptal</Button>
          {!canSave && <span className="text-xs text-slate-400">Kural adı ve tetikleyen olay zorunludur.</span>}
        </div>
      </div>
    </div>
  );
}

// ── Kural Kartı ───────────────────────────────────────────────────────────────
function RuleCard({ rule, templates, onUpdate, onDelete, expanded, onToggleExpand }: {
  rule: Rule; templates: Template[];
  onUpdate: (r: Rule) => void; onDelete: () => void;
  expanded: boolean; onToggleExpand: () => void;
}) {
  const { catalog } = useCatalog();
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <RuleForm initial={rule} templates={templates} title="Kuralı Düzenle"
        onSave={updated => { onUpdate({ ...rule, ...updated }); setEditing(false); }}
        onCancel={() => setEditing(false)} />
    );
  }

  const ev = getEventFromCatalog(catalog, rule.eventType);
  return (
    <div className={clsx("border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 transition-opacity", !rule.active && "opacity-60")}>
      <div onClick={onToggleExpand}
        className={clsx("flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors", expanded ? "bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700" : "")}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{rule.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 font-bold">
              P{rule.priority}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs text-slate-600 dark:text-slate-300">{rule.eventType}</code>
              {ev && <span className="text-slate-400">· {ev.label}</span>}
            </span>
            {rule.cancelOn && (
              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <XCircle className="w-3 h-3" />
                <code className="bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded">{rule.cancelOn}</code>
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" /> {rule.sendWindow.start}–{rule.sendWindow.end}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{rule.escalations.length} SEVİYE</span>
          <Toggle checked={rule.active} onChange={v => onUpdate({ ...rule, active: v })} size="sm" />
          <IconButtonRow>
            <IconButton variant="edit" icon={<Edit2 className="w-4 h-4" />} onClick={() => setEditing(true)} title="Düzenle" />
            <IconButton variant="delete" icon={<Trash2 className="w-4 h-4" />} onClick={onDelete} title="Sil" />
          </IconButtonRow>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
          <ChevronDown className={clsx("w-5 h-5 text-slate-400 transition-transform duration-300", expanded && "rotate-180")} />
        </div>
      </div>

      {expanded && (
        <div className="p-4">
          <div className="flex flex-col">
            {rule.escalations.map((esc, i) => (
              <EscalationRow key={esc.level} esc={esc} isLast={i === rule.escalations.length - 1}
                templates={templates} eventId={rule.eventType}
                onUpdate={updated => onUpdate({ ...rule, escalations: rule.escalations.map(e => e.level === esc.level ? updated : e) })}
                onDelete={() => onUpdate({ ...rule, escalations: rule.escalations.filter(e => e.level !== esc.level) })} />
            ))}
          </div>
          <Button
            variant="outline"
            iconLeft={<Plus className="w-4 h-4" />}
            onClick={() => {
              const nextLevel = rule.escalations.length + 1;
              onUpdate({ ...rule, escalations: [...rule.escalations, { level: nextLevel, label: `Seviye ${nextLevel}`, delayAmount: 1, delayUnit: "days", delayFrom: "event", conditions: [], channels: ["email"], channelTemplates: {}, retry: { enabled: false, count: 1, intervalHours: 24 } }] });
            }}
            className="mt-4 w-full border-dashed border-slate-300 dark:border-slate-700 h-10"
          >
            Seviye ekle
          </Button>
        </div>
      )}
    </div>
  );
}

// ── TAB: Kurallar ─────────────────────────────────────────────────────────────
function KurallarTab({ templates, rules, setRules }: {
  templates: Template[];
  rules: Rule[];
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
}) {
  const [expanded, setExpanded] = useState<string | null>("r1");
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {rules.map(rule => (
        <RuleCard key={rule.id} rule={rule} templates={templates}
          onUpdate={u => setRules(rules.map(r => r.id === u.id ? u : r))}
          onDelete={() => setRules(rules.filter(r => r.id !== rule.id))}
          expanded={expanded === rule.id}
          onToggleExpand={() => setExpanded(expanded === rule.id ? null : rule.id)} />
      ))}
      {showNew ? (
        <RuleForm templates={templates}
          onSave={r => { setRules([...rules, { ...r, id: uid("r") }]); setShowNew(false); }}
          onCancel={() => setShowNew(false)} />
      ) : (
        <Button
          variant="outline"
          iconLeft={<Plus className="w-5 h-5" />}
          onClick={() => setShowNew(true)}
          className="w-full h-14 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-bold text-sm tracking-wide hover:bg-blue-100/50 transition-all shadow-sm"
        >
          Yeni kural oluştur
        </Button>
      )}
    </div>
  );
}

// ── Alan Düzenleme Satırı ─────────────────────────────────────────────────────
function FieldEditRow({ draft, setDraft, onSave, onCancel }: {
  draft: EventField;
  setDraft: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <Tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white/40 dark:bg-slate-900/40 transition-colors">
      <Td>
        <Input
          value={draft.key}
          onChange={e => setDraft({ ...draft, key: e.target.value })}
          placeholder="alan_key"
          className="font-mono bg-white dark:bg-slate-900"
        />
      </Td>
      <Td>
        <Input
          value={draft.label}
          onChange={e => setDraft({ ...draft, label: e.target.value })}
          placeholder="Etiket"
          className="bg-white dark:bg-slate-900"
        />
      </Td>
      <Td>
        <Select
          value={draft.type}
          onChange={e => {
            const val = e.target.value as any;
            setDraft({ ...draft, type: val, values: val === "enum" ? (draft.values ?? []) : undefined });
          }}
          options={[
            { label: "Seçenek (Enum)", value: "enum" },
            { label: "Sayı", value: "number" },
            { label: "Tarih", value: "date" },
          ]}
          className="bg-white dark:bg-slate-900"
        />
      </Td>
      <Td>
        {draft.type === "enum" && (
          <Input
            value={(draft.values ?? []).join(", ")}
            onChange={e => setDraft({ ...draft, values: e.target.value.split(",").map(v => v.trim()).filter(Boolean) })}
            placeholder="elma, armut, muz..."
            className="bg-white dark:bg-slate-900"
          />
        )}
      </Td>
      <Td>
        <IconButtonRow className="justify-end">
          <IconButton variant="ok" icon={<CheckCircle2 className="w-4 h-4" />} onClick={onSave} title="Kaydet" />
          <IconButton variant="delete" icon={<RotateCcw className="w-4 h-4" />} onClick={onCancel} title="İptal" />
        </IconButtonRow>
      </Td>
    </Tr>
  );
}

// ── Olay Ekleme/Düzenleme Modalı ──────────────────────────────────────────────
function EventModal({ open, mode, initial, initialGroup, groups, allEvents, onClose, onSave }: {
  open: boolean; mode: "add" | "edit";
  initial: CatalogEvent | null; initialGroup: string;
  groups: string[]; allEvents: CatalogEvent[];
  onClose: () => void; onSave: (ev: CatalogEvent, group: string) => void;
}) {
  const blankEv: CatalogEvent = { id: "", label: "", description: "", cancelEvents: [], fields: [] };
  const [ev, setEv] = useState<CatalogEvent>(initial ?? blankEv);
  const [group, setGroup] = useState(initialGroup);
  const [newGroup, setNewGroup] = useState("");
  const [isNewGroup, setIsNewGroup] = useState(false);

  useEffect(() => {
    if (open) {
      setEv(initial ? { ...initial, cancelEvents: [...initial.cancelEvents] } : blankEv);
      setGroup(initialGroup);
      setIsNewGroup(false);
      setNewGroup("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const finalGroup = isNewGroup ? newGroup : group;
  const canSave = ev.id.trim() && ev.label.trim() && finalGroup.trim();

  const toggleCancel = (id: string) =>
    setEv(prev => ({
      ...prev,
      cancelEvents: prev.cancelEvents.includes(id)
        ? prev.cancelEvents.filter(c => c !== id)
        : [...prev.cancelEvents, id],
    }));

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Modal.Header
        title={mode === "add" ? "Yeni Olay Ekle" : "Olayı Düzenle"}
        onClose={onClose}
        icon={<List className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
      />
      <Modal.Content className="space-y-6 !pb-8">
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Modal.Label required>Olay ID</Modal.Label>
            <Input
              value={ev.id}
              onChange={e => setEv({ ...ev, id: e.target.value })}
              placeholder="event.type"
              readOnly={mode === "edit"}
              className={clsx(mode === "edit" && "bg-slate-50 dark:bg-slate-900 border-none")}
            />
            {mode === "edit" && <p className="text-[10px] text-slate-400 ml-1">Kayıtlı olayların ID'si değiştirilemez</p>}
          </div>
          <div className="space-y-1.5">
            <Modal.Label required>Olay Adı</Modal.Label>
            <Input
              value={ev.label}
              onChange={e => setEv({ ...ev, label: e.target.value })}
              placeholder="ör. Ödeme Gecikmesi"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Modal.Label>Açıklama</Modal.Label>
          <Input
            value={ev.description}
            onChange={e => setEv({ ...ev, description: e.target.value })}
            placeholder="Bu olay tam olarak ne zaman tetiklenir? (ör. Vade geçtikten 24 saat sonra)"
          />
        </div>
        <div className="space-y-2.5">
          <Modal.Label required>Grup / Kategori</Modal.Label>
          <div className="flex gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {isNewGroup ? (
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <Input
                    autoFocus
                    value={newGroup}
                    onChange={e => setNewGroup(e.target.value)}
                    placeholder="Yeni grup adını girin..."
                    className="bg-white dark:bg-slate-950"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsNewGroup(false)} className="shrink-0">Listeden Seç</Button>
              </div>
            ) : (
              <div className="flex-1 flex gap-2">
                <Select
                  value={group}
                  onChange={e => setGroup(e.target.value)}
                  options={groups.map(g => ({ label: g, value: g }))}
                  className="bg-white dark:bg-slate-950 flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => setIsNewGroup(true)} className="shrink-0 text-blue-600 hover:text-blue-700 font-bold border-2 border-dashed border-blue-100">+ Yeni</Button>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2.5">
          <Modal.Label>Otomatik İptal Tetikleyicileri</Modal.Label>
          <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[100px]">
            {allEvents.filter(e => e.id !== ev.id).map(e => {
              const checked = ev.cancelEvents.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleCancel(e.id)}
                  className={clsx(
                    "text-xs px-3 py-2 rounded-lg border font-medium transition-all flex items-center gap-2",
                    checked
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className={clsx("w-1.5 h-1.5 rounded-full", checked ? "bg-white" : "bg-slate-300 dark:bg-slate-700")} />
                  {e.label}
                </button>
              );
            })}
            {allEvents.filter(e => e.id !== ev.id).length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                <Bell className="w-8 h-8 opacity-20 mb-2" />
                <span className="text-xs italic">Seçilebilecek başka olay tanımlı değil</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 pl-1 italic">Yukarıdaki olaylardan biri tetiklendiğinde, bu olaya bağlı tüm aktif bildirim süreçleri otomatik olarak durdurulur.</p>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Button variant="outline" onClick={onClose}>İptal</Button>
        <Button onClick={() => { if (canSave) onSave(ev, finalGroup); }} disabled={!canSave}>
          {mode === "add" ? "Oluştur" : "Kaydet"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// ── TAB: Olay Kataloğu ────────────────────────────────────────────────────────
function OlayKatalogTab() {
  const { catalog, setCatalog } = useCatalog();
  const allEvents = catalog.flatMap(g => g.events);
  const [selectedId, setSelectedId] = useState(allEvents[0]?.id ?? "");

  const [modal, setModal] = useState<{
    open: boolean; mode: "add" | "edit";
    event: CatalogEvent | null; group: string;
  }>({ open: false, mode: "add", event: null, group: "" });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] = useState<EventField | null>(null);
  const [addingField, setAddingField] = useState(false);
  const [newField, setNewField] = useState<EventField>({ key: "", label: "", type: "enum", values: [] });

  const ev = allEvents.find(e => e.id === selectedId);
  const groups = catalog.map(g => g.group);

  const openAddEvent = () => {
    setModal({ open: true, mode: "add", event: { id: "", label: "", description: "", cancelEvents: [], fields: [] }, group: groups[0] ?? "" });
  };

  const openEditEvent = (evItem: CatalogEvent) => {
    const grp = catalog.find(g => g.events.some(e => e.id === evItem.id))?.group ?? "";
    setModal({ open: true, mode: "edit", event: { ...evItem, cancelEvents: [...evItem.cancelEvents] }, group: grp });
  };

  const deleteEvent = (eventId: string) => {
    setCatalog(prev => {
      const next = prev
        .map(g => ({ ...g, events: g.events.filter(e => e.id !== eventId) }))
        .filter(g => g.events.length > 0);
      if (selectedId === eventId) {
        const remaining = next.flatMap(g => g.events);
        setSelectedId(remaining[0]?.id ?? "");
      }
      return next;
    });
  };

  const saveEvent = (evData: CatalogEvent, group: string) => {
    setCatalog(prev => {
      // Remove event from all groups (handles group change in edit mode)
      let next = prev.map(g => ({
        ...g,
        events: modal.mode === "edit" ? g.events.filter(e => e.id !== evData.id) : g.events,
      })).filter(g => g.events.length > 0);

      const targetGroup = next.find(g => g.group === group);
      if (targetGroup) {
        next = next.map(g => g.group === group ? { ...g, events: [...g.events, evData] } : g);
      } else {
        next = [...next, { group, events: [evData] }];
      }
      return next;
    });
    setSelectedId(evData.id);
    setModal({ open: false, mode: "add", event: null, group: "" });
  };

  const saveField = (eventId: string, field: EventField, isNew: boolean) => {
    setCatalog(prev => prev.map(g => ({
      ...g,
      events: g.events.map(e => e.id !== eventId ? e : {
        ...e,
        fields: isNew
          ? [...e.fields, field]
          : e.fields.map(f => f.key === editingField ? field : f),
      }),
    })));
    setEditingField(null);
    setFieldDraft(null);
    setAddingField(false);
    setNewField({ key: "", label: "", type: "enum", values: [] });
  };

  const deleteField = (eventId: string, fieldKey: string) => {
    setCatalog(prev => prev.map(g => ({
      ...g,
      events: g.events.map(e => e.id !== eventId ? e : {
        ...e,
        fields: e.fields.filter(f => f.key !== fieldKey),
      }),
    })));
  };

  const tabItems: TabItem[] = catalog.flatMap(group => 
    group.events.map(e => ({
      key: e.id,
      label: (
        <div className="flex-1 min-w-0 pr-2">
          <div className="text-sm font-semibold truncate transition-colors">{e.label}</div>
          <code className="text-[10px] opacity-50 truncate block font-mono">{e.id}</code>
        </div>
      ),
      content: (
        <div className="flex-1 flex flex-col gap-4">
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-bold text-lg text-slate-800 dark:text-slate-100">{e.label}</div>
                  <IconButtonRow>
                    <IconButton variant="edit" icon={<Edit2 className="w-4 h-4" />} onClick={() => openEditEvent(e)} title="Düzenle" />
                    <IconButton variant="delete" icon={<Trash2 className="w-4 h-4" />} onClick={() => deleteEvent(e.id)} title="Sil" />
                  </IconButtonRow>
                </div>
                <code className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:blue-400 px-2.5 py-1 rounded-md font-mono border border-blue-100 dark:border-blue-800/50">{e.id}</code>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{e.description}</p>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Olay Alanları
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Bu alanlar bildirim koşullalarında kullanılabilir</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                iconLeft={<Plus className="w-3.5 h-3.5" />}
                onClick={() => { setAddingField(true); setNewField({ key: "", label: "", type: "enum", values: [] }); }}
              >Alan Ekle</Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <Thead>
                    <Tr>
                    <Th className="w-1/4">Alan Adı (key)</Th>
                    <Th className="w-1/4">Etiket</Th>
                    <Th className="w-1/6">Tip</Th>
                    <Th>Olası Değerler</Th>
                    <Th className="w-20">Aksiyonlar</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {e.fields.map(f =>
                    editingField === f.key && fieldDraft ? (
                      <FieldEditRow key={f.key} draft={fieldDraft} setDraft={setFieldDraft}
                        onSave={() => saveField(e.id, fieldDraft, false)}
                        onCancel={() => { setEditingField(null); setFieldDraft(null); }} />
                    ) : (
                      <Tr key={f.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <Td><code className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-200 dark:border-slate-700">{f.key}</code></Td>
                        <Td className="font-medium">{f.label}</Td>
                        <Td>
                          <Badge variant={f.type === "enum" ? "amber" : f.type === "number" ? "blue" : "emerald"} size="sm">
                            {f.type}
                          </Badge>
                        </Td>
                        <Td>
                          {f.values ? (
                            <div className="flex flex-wrap gap-1">
                              {f.values.map(v => (
                                <code key={v} className="text-[11px] bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">{v}</code>
                              ))}
                            </div>
                          ) : <span className="text-slate-400 text-xs italic">serbest değer</span>}
                        </Td>
                        <Td>
                          <IconButtonRow className="justify-end">
                            <IconButton variant="edit" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => { setEditingField(f.key); setFieldDraft({ ...f, values: f.values ? [...f.values] : undefined }); }} />
                            <IconButton variant="delete" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => deleteField(e.id, f.key)} />
                          </IconButtonRow>
                        </Td>
                      </Tr>
                    )
                  )}
                  {addingField && (
                    <FieldEditRow draft={newField} setDraft={setNewField}
                      onSave={() => saveField(e.id, newField, true)}
                      onCancel={() => setAddingField(false)} />
                  )}
                  {e.fields.length === 0 && !addingField && (
                    <Tr>
                      <Td colSpan={5} align="center">
                        <div className="py-8 flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600">
                          <Trash2 className="w-8 h-8 opacity-20" />
                          <span className="text-xs italic">Henüz alan tanımlanmamış</span>
                        </div>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </div>
          </div>

          {e.cancelEvents?.length > 0 && (
            <div className="border border-red-100 dark:border-red-900/30 rounded-xl p-5 bg-red-50/30 dark:bg-red-950/20">
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-3">İptal Olayları</p>
              <div className="flex flex-wrap gap-2">
                {e.cancelEvents.map(c => {
                  const cancelEv = allEvents.find(ev => ev.id === c);
                  return (
                    <div key={c} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-red-100 dark:border-red-800 shadow-sm">
                      <code className="text-red-600 dark:text-red-400 text-xs font-mono">{c}</code>
                      {cancelEv && <span className="text-slate-600 dark:text-slate-400 font-medium text-xs">{cancelEv.label}</span>}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-slate-500 italic">Bu olaylardan biri tetiklendiğinde, bu kurala bağlı tüm aktif bildirim süreçleri anında durdurulur.</p>
            </div>
          )}
        </div>
      )
    }))
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Katalog Yönetimi</span>
        <Button size="xs" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={openAddEvent}>Yeni Olay Ekle</Button>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-1">
        <Tabs
          orientation="vertical"
          variant="default"
          items={tabItems}
          activeKey={selectedId}
          onChange={setSelectedId}
          className="min-h-[600px]"
        />
      </div>

      <EventModal
        open={modal.open}
        mode={modal.mode}
        initial={modal.event}
        initialGroup={modal.group}
        groups={groups}
        allEvents={allEvents}
        onClose={() => setModal({ open: false, mode: "add", event: null, group: "" })}
        onSave={saveEvent}
      />
    </div>
  );
}

// ── TAB: Şablonlar ────────────────────────────────────────────────────────────
const VARS = ["{{musteri_adi}}", "{{tutar}}", "{{son_odeme_tarihi}}", "{{gecikme_gun}}", "{{sozlesme_adi}}", "{{bitis_tarihi}}", "{{kalan_gun}}", "{{siparis_no}}", "{{yeni_durum}}"];

function SablonlarTab({ templates, setTemplates }: { templates: Template[]; setTemplates: React.Dispatch<React.SetStateAction<Template[]>> }) {
  const [selected, setSelected] = useState("t1");
  const [editing, setEditing] = useState(false);
  const tpl = templates.find(t => t.id === selected);
  const [draft, setDraft] = useState<Template>(tpl ?? templates[0]);

  const selectTemplate = (id: string) => {
    const t = templates.find(t => t.id === id);
    if (!t) return;
    setSelected(id); setDraft(t); setEditing(false);
  };

  const save = () => { setTemplates(templates.map(t => t.id === draft.id ? draft : t)); setEditing(false); };

  const addTemplate = () => {
    const id = uid("t");
    const tNew: Template = { id, name: "Yeni Şablon", channel: "email", subject: "", body: "" };
    setTemplates([...templates, tNew]);
    setSelected(id); setDraft(tNew); setEditing(true);
  };

  const tabItems: TabItem[] = templates.map(t => {
    const ChIcon = CHANNEL_META[t.channel]?.icon || Bell;
    return {
      key: t.id,
      label: (
        <div className="flex-1 min-w-0 pr-2">
          <div className="text-sm font-semibold truncate">{t.name}</div>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-50 uppercase font-bold tracking-widest">
            <ChIcon className="w-3 h-3" /> {t.channel}
          </div>
        </div>
      ),
      content: (
        <div className="flex-1 flex flex-col gap-5 p-1">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Şablon Adı</p>
              <Input
                value={draft.name}
                onChange={e => setDraft({ ...draft, name: e.target.value })}
                readOnly={!editing}
                placeholder="ör. Fatura Hatırlatıcı"
                className={clsx("!h-10 font-semibold", !editing && "bg-slate-50 dark:bg-slate-900 cursor-default")}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Gönderim Kanalı</p>
              <Select
                value={draft.channel}
                onChange={e => editing && setDraft({ ...draft, channel: e.target.value as unknown as Template["channel"] })}
                options={[
                  { label: "E-posta", value: "email" },
                  { label: "SMS", value: "sms" },
                  { label: "Push Bildirimi", value: "push" },
                ]}
                className={clsx("!h-10", !editing && "bg-slate-50 dark:bg-slate-900 pointer-events-none cursor-default")}
              />
            </div>
          </div>

          {draft.channel === "email" && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">E-Posta Konusu</p>
              <Input
                value={draft.subject}
                onChange={e => setDraft({ ...draft, subject: e.target.value })}
                readOnly={!editing}
                placeholder="Bildirim konusu..."
                className={clsx("!h-10", !editing && "bg-slate-50 dark:bg-slate-900 cursor-default")}
              />
            </div>
          )}

          <div className="flex-1 space-y-1.5 min-h-0 flex flex-col">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">İçerik Şablonu</p>
            <Textarea
              value={draft.body}
              onChange={e => setDraft({ ...draft, body: e.target.value })}
              readOnly={!editing}
              rows={8}
              placeholder="Mesaj içeriğini buraya yazın..."
              className={clsx("flex-1 min-h-[200px] font-medium resize-none !px-4 !py-3 leading-relaxed", !editing && "bg-slate-50 dark:bg-slate-900 cursor-default")}
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Dinamik Değişkenler
            </p>
            <div className="flex flex-wrap gap-1.5">
              {VARS.map(v => (
                <button
                  key={v}
                  onClick={() => editing && setDraft({ ...draft, body: draft.body + v })}
                  disabled={!editing}
                  className={clsx(
                    "text-[11px] px-2.5 py-1.5 rounded-lg border font-mono transition-all",
                    editing
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm"
                      : "bg-slate-100/50 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-600 flex-shrink-0"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {editing ? (
              <>
                <Button onClick={save} iconLeft={<CheckCircle2 className="w-4 h-4" />}>Kaydet</Button>
                <Button variant="outline" onClick={() => { if (tpl) setDraft(tpl); setEditing(false); }}>İptal</Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} iconLeft={<Edit2 className="w-3.5 h-3.5" />}>Şablonu Düzenle</Button>
            )}
          </div>
        </div>
      )
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Mesaj Şablonları</span>
        <Button size="xs" variant="outline" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={addTemplate}>Yeni Şablon</Button>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-1">
        <Tabs
          orientation="vertical"
          variant="default"
          items={tabItems}
          activeKey={selected}
          onChange={selectTemplate}
          className="min-h-[600px]"
        />
      </div>
    </div>
  );
}

// ── TAB: Log ─────────────────────────────────────────────────────────────────
function LogTab() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const stats = {
    total:     SEED_LOGS.length,
    delivered: SEED_LOGS.filter(l => l.status === "delivered").length,
    failed:    SEED_LOGS.filter(l => l.status === "failed").length,
    pending:   SEED_LOGS.filter(l => l.status === "pending").length,
  };

  const filtered = SEED_LOGS.filter(l =>
    (filter === "all" || l.status === filter) &&
    (!search || l.recipient.toLowerCase().includes(search.toLowerCase()) || l.rule.toLowerCase().includes(search.toLowerCase()))
  );

  const statCards = [
    { label: "Toplam",    value: stats.total,     variant: "blue"    as const },
    { label: "Başarılı",  value: stats.delivered, variant: "emerald" as const },
    { label: "Başarısız", value: stats.failed,    variant: "red"     as const },
    { label: "Bekliyor",  value: stats.pending,   variant: "amber"   as const },
  ];

  const filterBtns = [
    { key: "all",       label: "Tümü"      },
    { key: "delivered", label: "İletildi"  },
    { key: "failed",    label: "Başarısız" },
    { key: "pending",   label: "Bekliyor"  },
  ];

  const statusBadge = (status: string) => {
    if (status === "delivered") return <Badge variant="emerald" size="sm">İletildi</Badge>;
    if (status === "failed")    return <Badge variant="red"     size="sm">Başarısız</Badge>;
    return                             <Badge variant="amber"   size="sm">Bekliyor</Badge>;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {statCards.map(s => (
          <div key={s.label} className={clsx(
            "px-4 py-3 rounded-lg border",
            s.variant === "blue"    && "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
            s.variant === "emerald" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800",
            s.variant === "red"     && "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
            s.variant === "amber"   && "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
          )}>
            <div className={clsx(
              "text-xs font-semibold uppercase tracking-wide opacity-80",
              s.variant === "blue"    && "text-blue-700 dark:text-blue-400",
              s.variant === "emerald" && "text-emerald-700 dark:text-emerald-400",
              s.variant === "red"     && "text-red-700 dark:text-red-400",
              s.variant === "amber"   && "text-amber-700 dark:text-amber-400",
            )}>{s.label}</div>
            <div className={clsx(
              "text-3xl font-bold leading-tight mt-1",
              s.variant === "blue"    && "text-blue-700 dark:text-blue-400",
              s.variant === "emerald" && "text-emerald-700 dark:text-emerald-400",
              s.variant === "red"     && "text-red-700 dark:text-red-400",
              s.variant === "amber"   && "text-amber-700 dark:text-amber-400",
            )}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
          {filterBtns.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 uppercase tracking-widest",
                filter === f.key
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600/50"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Input
          placeholder="Alıcı veya kural ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto !w-64 !h-11"
          iconLeft={<BarChart2 className="w-4 h-4 text-slate-400" />}
        />
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Zaman</Th>
              <Th>Alıcı</Th>
              <Th>Kural</Th>
              <Th>Seviye</Th>
              <Th>Kanal</Th>
              <Th>Durum</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map(log => {
              const ChIcon = CHANNEL_META[log.channel]?.icon || Bell;
              const lvl = Math.min(log.level, 3) as 1 | 2 | 3;
              return (
                <Tr key={log.id}>
                  <Td><span className="font-mono text-xs">{log.ts}</span></Td>
                  <Td><span className="font-medium text-slate-800 dark:text-slate-200">{log.recipient}</span></Td>
                  <Td>{log.rule}</Td>
                  <Td><Badge variant={LEVEL_BADGE[lvl]} size="sm">{LEVEL_LABEL[lvl]}</Badge></Td>
                  <Td>
                    <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <ChIcon className="w-3.5 h-3.5" />
                      {CHANNEL_META[log.channel]?.label || log.channel}
                    </span>
                  </Td>
                  <Td>{statusBadge(log.status)}</Td>
                </Tr>
              );
            })}
            {filtered.length === 0 && (
              <Tr>
                <Td colSpan={6} align="center">
                  <span className="text-slate-400 text-sm">Kayıt bulunamadı</span>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}

// ── TAB: Alıcı Tercihleri ─────────────────────────────────────────────────────
function AliciTercihleriTab({ prefs, setPrefs }: {
  prefs: Pref[];
  setPrefs: React.Dispatch<React.SetStateAction<Pref[]>>;
}) {
  const toggle = (id: string, field: keyof Pref) =>
    setPrefs(prefs.map(p => p.id === id ? { ...p, [field]: !p[field as keyof Pref] } : p));

  return (
    <div className="flex flex-col gap-3">
      <div className="px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
        Opt-out tercihli kullanıcılara yalnızca zorunlu (hukuki) bildirimler gönderilir.
      </div>
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Kullanıcı</Th>
              <Th>E-posta</Th>
              <Th>SMS</Th>
              <Th>Push</Th>
              <Th>Opt-out</Th>
            </Tr>
          </Thead>
          <Tbody>
            {prefs.map(p => (
              <Tr key={p.id} className={p.optOut ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                      p.optOut ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                    )}>
                      {p.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                    {p.optOut && <Badge variant="red" size="sm">Opt-out</Badge>}
                  </div>
                </Td>
                <Td><Toggle checked={p.email && !p.optOut} onChange={() => !p.optOut && toggle(p.id, "email")} size="sm" /></Td>
                <Td><Toggle checked={p.sms && !p.optOut} onChange={() => !p.optOut && toggle(p.id, "sms")} size="sm" /></Td>
                <Td><Toggle checked={p.push && !p.optOut} onChange={() => !p.optOut && toggle(p.id, "push")} size="sm" /></Td>
                <Td><Toggle checked={p.optOut} onChange={() => toggle(p.id, "optOut")} size="sm" /></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}

// ── Ana Bileşen ───────────────────────────────────────────────────────────────
export default function BildirimAyarlari() {
  const [catalog, setCatalog] = useState<EventGroup[]>(EVENT_CATALOG);
  const [templates, setTemplates] = useState<Template[]>(SEED_TEMPLATES);
  const [rules, setRules]         = useState<Rule[]>(SEED_RULES);
  const [prefs, setPrefs]         = useState<Pref[]>(SEED_PREFS);
  const [activeTab, setActiveTab] = useState("kurallar");

  // content: boş string — Tabs bileşeni içerik alanı render etmesin
  const tabItems: TabItem[] = [
    { key: "kurallar",  label: "Kurallar",        icon: <Zap />,       content: "" },
    { key: "olaylar",   label: "Olay Kataloğu",   icon: <List />,      content: "" },
    { key: "sablonlar", label: "Şablonlar",        icon: <FileText />,  content: "" },
    { key: "log",       label: "Log",              icon: <BarChart2 />, content: "" },
    { key: "tercihler", label: "Alıcı Tercihleri", icon: <User />,      content: "" },
  ];

  return (
    <CatalogContext.Provider value={{ catalog, setCatalog }}>
      <div>
        <Tabs items={tabItems} variant="filled" activeKey={activeTab} onChange={setActiveTab} />
        <div className="pt-2">
          <div className={activeTab !== "kurallar"  ? "hidden" : ""}><KurallarTab templates={templates} rules={rules} setRules={setRules} /></div>
          <div className={activeTab !== "olaylar"   ? "hidden" : ""}><OlayKatalogTab /></div>
          <div className={activeTab !== "sablonlar" ? "hidden" : ""}><SablonlarTab templates={templates} setTemplates={setTemplates} /></div>
          <div className={activeTab !== "log"       ? "hidden" : ""}><LogTab /></div>
          <div className={activeTab !== "tercihler" ? "hidden" : ""}><AliciTercihleriTab prefs={prefs} setPrefs={setPrefs} /></div>
        </div>
      </div>
    </CatalogContext.Provider>
  );
}
