import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Terminal, Plus, Trash2, Edit2, AlertCircle, RefreshCw, LayoutTemplate } from 'lucide-react';

export default function TenantManager() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTenants, setSelectedTenants] = useState([]);

    // Formulario para nuevo/editar tenant
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        projectId: '',
        firebaseToken: '',
        plan: 'Basic',
        maxEmployees: 30
    });

    useEffect(() => {
        const q = query(collection(db, 'tenants'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tenantData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTenants(tenantData);
            setLoading(false);
        }, (error) => {
            console.error("Error al obtener tenants:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedTenants(tenants.map(t => t.id));
        } else {
            setSelectedTenants([]);
        }
    };

    const handleSelect = (id) => {
        setSelectedTenants(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateDoc(doc(db, 'tenants', editingId), formData);
            } else {
                await addDoc(collection(db, 'tenants'), {
                    ...formData,
                    createdAt: new Date(),
                    status: 'active'
                });
            }
            setIsFormOpen(false);
            setFormData({ name: '', projectId: '', firebaseToken: '', plan: 'Basic', maxEmployees: 30 });
            setEditingId(null);
        } catch (err) {
            alert("Error al guardar: " + err.message);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${name}? Esto solo lo borra del panel, no borra el proyecto de Google.`)) {
            await deleteDoc(doc(db, 'tenants', id));
            setSelectedTenants(prev => prev.filter(t => t !== id));
        }
    };

    const editTenant = (t) => {
        setFormData({
            name: t.name,
            projectId: t.projectId,
            firebaseToken: t.firebaseToken || '',
            plan: t.plan || 'Basic',
            maxEmployees: t.maxEmployees || 30
        });
        setEditingId(t.id);
        setIsFormOpen(true);
    };

    const triggerDeploy = async () => {
        if (selectedTenants.length === 0) {
            alert("Selecciona al menos un cliente en la tabla.");
            return;
        }

        const count = selectedTenants.length;
        if (!window.confirm(`Mandarás una actualización de código para ${count} cliente(s) seleccionados. ¿Continuar?`)) return;

        alert(`Simulación: Despliegue iniciado para ${count} clientes.`);
    };

    return (
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200">

            {/* Header del Gestor */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                        <LayoutTemplate className="text-blue-500 w-8 h-8" />
                        Proyectos de Clientes Activos
                    </h2>
                    <p className="text-slate-500 text-base mt-2 font-medium">Gestiona y selecciona las bases de datos externas para actualizar el código.</p>
                </div>

                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <button
                        onClick={() => { setFormData({ name: '', projectId: '', firebaseToken: '', plan: 'Basic', maxEmployees: 30 }); setEditingId(null); setIsFormOpen(true); }}
                        className="px-6 py-3.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-bold rounded-xl flex items-center justify-center gap-2 transition"
                    >
                        <Plus size={20} /> Nuevo Cliente
                    </button>

                    <button
                        onClick={triggerDeploy}
                        disabled={selectedTenants.length === 0}
                        className={`px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition font-bold ${selectedTenants.length > 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.3)]'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <RefreshCw size={20} className={selectedTenants.length > 0 ? 'animate-spin-slow' : ''} />
                        Desplegar a Seleccionados ({selectedTenants.length})
                    </button>
                </div>
            </div>

            {/* Formulario Modal (Inline por ahora) */}
            {isFormOpen && (
                <div className="mb-10 bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-inner">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        {editingId ? <Edit2 className="text-blue-500" /> : <Plus className="text-blue-500" />}
                        {editingId ? 'Editar Cliente Existente' : 'Registrar Nuevo Cliente'}
                    </h3>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Nombre Comercial o Dueño</label>
                            <input required type="text" className="input-field shadow-sm bg-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Sucursal Norte S.A." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Firebase Project ID <span className="text-slate-400 font-normal">(El identificador de Google)</span></label>
                            <input required type="text" className="input-field shadow-sm bg-white font-mono text-blue-600 font-bold tracking-wide" value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })} placeholder="Ej: sucursal-norte-xyz" />
                        </div>
                        <div className="flex items-center gap-4 md:col-span-2 pt-4 border-t border-slate-200 mt-2">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition">Cancelar</button>
                            <button type="submit" className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-[0_4px_14px_rgba(16,185,129,0.4)]">Finalizar Guardado</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabla */}
            {loading ? (
                <div className="py-20 flex justify-center items-center flex-col gap-4">
                    <Terminal className="text-slate-300 animate-pulse w-12 h-12" />
                    <p className="text-slate-500 font-medium">Buscando en la base central...</p>
                </div>
            ) : tenants.length === 0 ? (
                <div className="py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <AlertCircle className="mx-auto w-14 h-14 mb-4 text-slate-300" />
                    <p className="text-lg font-medium">La base de datos está totalmente vacía.</p>
                    <p className="text-sm mt-2 text-slate-400">Comienza registrando un cliente usando el Project ID.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200 font-bold">
                            <tr>
                                <th className="p-5 w-16 text-center">
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedTenants.length === tenants.length && tenants.length > 0} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                </th>
                                <th className="p-5">Comercial / Identidad</th>
                                <th className="p-5">Project ID</th>
                                <th className="p-5 text-center">Estado del Link</th>
                                <th className="p-5 text-right">Manejo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {tenants.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 transition duration-150 group">
                                    <td className="p-5 text-center">
                                        <input type="checkbox" checked={selectedTenants.includes(t.id)} onChange={() => handleSelect(t.id)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                    </td>
                                    <td className="p-5">
                                        <span className="font-bold text-slate-800 text-base">{t.name}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{t.projectId}</span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Verificado
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => editTenant(t)} className="p-2.5 bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar datos"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(t.id, t.name)} className="p-2.5 bg-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Remover de la base"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
