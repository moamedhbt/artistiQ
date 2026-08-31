'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { getStoredOrders, updateOrderStatus, deleteOrder } from '@/lib/storage';
import { createEyebrowStencil3DGeometry, exportBufferGeometryToBinarySTL, downloadSTLFile } from '@/lib/stlGenerator';
import { Cpu, Download, Printer, Trash2, CheckCircle2, Search, Filter, RefreshCw, X, FileText, Phone, MapPin } from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadOrders = () => {
    setOrders(getStoredOrders());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    loadOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleDelete = (orderId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
      deleteOrder(orderId);
      loadOrders();
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    }
  };

  const handleDownloadOrderSTL = (order: Order) => {
    try {
      const { stencilMesh } = createEyebrowStencil3DGeometry(order.customParams, order.biometrics);
      const buffer = exportBufferGeometryToBinarySTL(stencilMesh);
      const filename = `ARTISTIQ_${order.id}_${order.clientInfo.fullName.replace(/\s+/g, '_')}.stl`;
      downloadSTLFile(buffer, filename);
    } catch (e) {
      console.error('Failed to generate STL for order:', e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesQuery =
      o.clientInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientInfo.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const statusLabels: Record<Order['status'], { label: string; style: string }> = {
    pending_print: { label: 'À imprimer 3D', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    in_molding: { label: 'Coulage Silicone', style: 'bg-biometric-cyan/10 text-biometric-cyan border-biometric-cyan/30' },
    quality_check: { label: 'Contrôle Symétrie', style: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    shipped: { label: 'Expédiée', style: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    delivered: { label: 'Livrée', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-2xl overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-obsidian-border pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-biometric-cyan/10 border border-biometric-cyan/30 flex items-center justify-center text-biometric-cyan shadow-cyan-glow">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                Espace Atelier & Production 3D
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Gestion des fichiers STL & Fabrication sur-mesure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-obsidian-card border border-obsidian-border text-gray-400 hover:text-white hover:border-gold transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, ville, N°..."
              className="w-full pl-10 pr-4 py-2.5 bg-obsidian-card border border-obsidian-border rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-gold"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'pending_print', label: 'À Imprimer 3D' },
              { id: 'in_molding', label: 'Coulage Silicone' },
              { id: 'shipped', label: 'Expédiées' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap border ${
                  filterStatus === st.id
                    ? 'bg-gold/10 text-gold border-gold/40 shadow-gold-glow'
                    : 'bg-obsidian-card text-gray-400 border-obsidian-border hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-obsidian-card border border-obsidian-border rounded-3xl overflow-hidden shadow-card-glow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-obsidian border-b border-obsidian-border text-gray-400 font-mono uppercase">
                <tr>
                  <th className="px-6 py-4">ID & Date</th>
                  <th className="px-6 py-4">Cliente & Ville</th>
                  <th className="px-6 py-4">Style & Dimensions</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions Fichier 3D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-border text-gray-300">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => {
                    const st = statusLabels[ord.status];
                    return (
                      <tr key={ord.id} className="hover:bg-obsidian-light/40 transition-colors">
                        <td className="px-6 py-4 font-mono">
                          <p className="font-bold text-gold">{ord.id}</p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(ord.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-semibold text-white">{ord.clientInfo.fullName}</p>
                          <p className="text-gray-400 text-[11px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gold" /> {ord.clientInfo.city} • {ord.clientInfo.phone}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-mono">
                          <p className="font-bold text-white uppercase text-[11px]">{ord.customParams.styleId}</p>
                          <p className="text-gray-400 text-[10px]">
                            L: {ord.customParams.lengthMm}mm | Ép: {ord.customParams.thicknessMm}mm | Écart: {ord.customParams.interGapMm}mm
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-mono border bg-obsidian focus:outline-none cursor-pointer ${st.style}`}
                          >
                            <option value="pending_print">À imprimer 3D</option>
                            <option value="in_molding">Coulage Silicone</option>
                            <option value="quality_check">Contrôle Symétrie</option>
                            <option value="shipped">Expédiée</option>
                            <option value="delivered">Livrée</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleDownloadOrderSTL(ord)}
                            className="px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/40 text-gold hover:bg-gold/20 font-mono text-[11px] inline-flex items-center gap-1.5 transition-all shadow-gold-glow"
                            title="Télécharger fichier STL pour imprimante 3D"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>STL 3D</span>
                          </button>

                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1.5 rounded-xl bg-obsidian border border-obsidian-border text-gray-300 hover:text-white font-mono text-[11px] inline-flex items-center gap-1 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Fiche</span>
                          </button>

                          <button
                            onClick={() => handleDelete(ord.id)}
                            className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Supprimer la commande"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-mono">
                      Aucune commande enregistrée pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-obsidian-card border border-gold/40 rounded-3xl p-6 max-w-lg w-full space-y-5 relative shadow-card-glow animate-scale-in">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-obsidian-border pb-3">
                <p className="text-xs font-mono text-gold">{selectedOrder.id}</p>
                <h3 className="text-xl font-serif font-bold text-white">
                  Fiche Technique & Biométrique
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-obsidian border border-obsidian-border">
                  <p className="font-semibold text-gold mb-1">Informations Client</p>
                  <p className="text-white font-bold">{selectedOrder.clientInfo.fullName}</p>
                  <p className="text-gray-300">Tél: {selectedOrder.clientInfo.phone}</p>
                  <p className="text-gray-300">Adresse: {selectedOrder.clientInfo.address}, {selectedOrder.clientInfo.city}</p>
                  {selectedOrder.clientInfo.notes && (
                    <p className="text-amber-400 text-[11px] pt-1">Note: {selectedOrder.clientInfo.notes}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-obsidian border border-obsidian-border">
                  <p className="font-semibold text-biometric-cyan mb-1">Cotes Biométriques Extraintes</p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div>Écart Inter-Sourcils: <span className="text-white font-bold">{selectedOrder.biometrics.interEyebrowGapMm} mm</span></div>
                    <div>Longueur Moyenne: <span className="text-white font-bold">{selectedOrder.biometrics.leftEyebrowLengthMm} mm</span></div>
                    <div>Hauteur Arcade: <span className="text-white font-bold">{selectedOrder.biometrics.leftArchHeightMm} mm</span></div>
                    <div>Indice Symétrie: <span className="text-emerald-400 font-bold">{selectedOrder.biometrics.facialSymmetryIndex}%</span></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => handleDownloadOrderSTL(selectedOrder)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-light via-gold to-gold-dark text-obsidian font-bold text-xs shadow-gold-glow flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le Fichier 3D (.STL)</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
