"use client";

import { AdminShell } from "@/components/AdminShell";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";

const formulasSeed = [
  { id: "f1", patient: "María Ortega", order: "MC-000023", lens: "Lentes progresivos", note: "OD: -1.25 / 0.50 x 160. OI: -1.50 / 0.75 x 15." },
  { id: "f2", patient: "Luis Pérez", order: "MC-000104", lens: "Montura + filtro UV", note: "OD: +0.50 / -0.25 x 90. OI: +0.25 / -0.50 x 15." },
  { id: "f3", patient: "Carmen Duran", order: "MC-000188", lens: "Lentes de contacto toricos", note: "OD: -2.00 / -1.25 x 175. OI: -2.25 / -1.50 x 5." },
];

export default function FormulasPage() {
  const [formulas, setFormulas] = useState(formulasSeed);
  const [selectedId, setSelectedId] = useState(formulasSeed[0].id);

  const selected = formulas.find((formula) => formula.id === selectedId) ?? formulas[0];

  function addFormula() {
    const next = {
      id: `f${Date.now()}`,
      patient: "Nuevo paciente",
      order: `MC-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      lens: "Nueva receta",
      note: "Agregar datos clínicos de la evaluación oftálmica.",
    };
    setFormulas((current) => [next, ...current]);
    setSelectedId(next.id);
  }

  return <AdminShell>{() => <>
    <header className="admin-page-header"><div><p className="admin-kicker">CLÍNICA</p><h1>Fórmulas</h1><span>{formulas.length} recetas y prescripciones</span></div><button className="admin-primary" onClick={addFormula}><Plus aria-hidden="true" size={16} />Nueva fórmula</button></header>

    <section className="admin-formula-layout">
      <aside className="admin-formula-list">
        {formulas.map((formula) => (
          <button key={formula.id} type="button" className={selectedId === formula.id ? "active" : undefined} onClick={() => setSelectedId(formula.id)}>
            <span>{formula.order}</span>
            <strong>{formula.patient}</strong>
            <small>{formula.lens}</small>
          </button>
        ))}
      </aside>

      <article className="admin-formula-detail">
        <div className="admin-panel-head"><div><p className="admin-kicker">PRESCRIPCIÓN</p><h2>{selected.patient}</h2></div><span className="admin-pill"><FileText aria-hidden="true" size={14} /> {selected.order}</span></div>
        <div className="admin-form-grid">
          <label>Paciente<input value={selected.patient} readOnly /></label>
          <label>Pedido<input value={selected.order} readOnly /></label>
          <label>Lente<input value={selected.lens} readOnly /></label>
        </div>
        <label>Fórmula oftálmica<textarea rows={8} value={selected.note} readOnly /></label>
      </article>
    </section>
  </>}</AdminShell>;
}
