import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Terminal, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

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
        firebaseToken: '', // Token especial si aplica o PAT
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
        if (window.confirm(`¿Estás seguro de eliminar al cliente ${name}? Esto no borrará su base de datos, solo lo quitará de este panel.`)) {
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
            alert("Selecciona al menos un cliente para desplegar.");
            return;
        }

        const count = selectedTenants.length;
        if (!window.confirm(`¿Estás seguro de iniciar el despliegue automático hacia ${count} cliente(s)?`)) return;

        // Aquí irá la lógica de despliegue hacia GitHub Actions / Cloud Functions
        alert(`Deploy iniciado para ${count} clientes (En desarrollo Fase 3)`);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Terminal className="text-emerald-400" />
                        Proyectos de Clientes (Tenants)
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Registra los Firebase de tus clientes para futuros despliegues masivos.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setFormData({ name: '', projectId: '', firebaseToken: '', plan: 'Basic', maxEmployees: 30 }); setEditingId(null); setIsFormOpen(true); }}
                        className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg flex items-center gap-2 transition"
                    >
                        <Plus size={18} /> Nuevo Cliente
                    </button>

                    <button
                        onClick={triggerDeploy}
                        disabled={selectedTenants.length === 0}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition font-bold ${selectedTenants.length > 0
                                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <RefreshCw size={18} className={selectedTenants.length > 0 ? 'animate-spin-slow' : ''} />
                        Desplegar Actualización ({selectedTenants.length})
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="mb-8 bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">{editingId ? 'Editar' : 'Agregar'} Cliente</h3>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Nombre Comercial / Dueño</label>
                            <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Supermercado Los Alpes" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Firebase Project ID</label>
                            <input required type="text" className="input-field font-mono text-sm" value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })} placeholder="Ej: cliente-alpes-cf" />
                        </div>
                        {/* Otros campos futuros */}
                        <div className="flex items-end gap-3 md:col-span-2 mt-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition">Guardar Cliente</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="py-12 flex justify-center"><Terminal className="text-gray-600 animate-pulse w-8 h-8" /></div>
            ) : tenants.length === 0 ? (
                <div className="py-12 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl">
                    <AlertCircle className="mx-auto w-10 h-10 mb-3 text-gray-600" />
                    <p>No hay clientes registrados aún.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-white/5">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                            <tr>
                                <th className="p-4 w-12">
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedTenants.length === tenants.length && tenants.length > 0} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-800" />
                                </th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Project ID</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-gray-900/30">
                            {tenants.map(t => (
                                <tr key={t.id} className="hover:bg-white/5 transition">
                                    <td className="p-4">
                                        <input type="checkbox" checked={selectedTenants.includes(t.id)} onChange={() => handleSelect(t.id)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900" />
                                    </td>
                                    <td className="p-4 font-medium text-white">{t.name}</td>
                                    <td className="p-4 font-mono text-xs text-blue-400">{t.projectId}</td>
                                    <td className="p-4 text-center">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => editTenant(t)} className="p-1.5 text-gray-400 hover:text-blue-400 transition"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(t.id, t.name)} className="p-1.5 text-gray-400 hover:text-red-400 transition ml-2"><Trash2 size={16} /></button>
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
