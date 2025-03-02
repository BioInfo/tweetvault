import React from 'react';
import { FolderOpen, Clock, Trash2 } from 'lucide-react';
import { Collection } from '../types';

interface CollectionCardProps {
  collection: Collection;
  selected?: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function CollectionCard({
  collection,
  selected,
  onSelect,
  onDelete
}: CollectionCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`w-full text-left bg-white rounded-xl p-4 border cursor-pointer transition-colors ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-200'
          : 'border-gray-200 hover:border-indigo-200'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
          <FolderOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{collection.name}</h3>
          <p className="text-sm text-gray-500">{collection.tweetIds.length} tweets</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-auto p-2 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {collection.description && (
        <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
      )}
      <div className="flex items-center text-xs text-gray-500">
        <Clock className="w-4 h-4 mr-1" />
        Updated {new Date(collection.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export function CreateCollectionModal({ isOpen, onClose, onCreate }: CreateCollectionModalProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Collection</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter collection name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter collection description"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onCreate(name.trim(), description.trim());
                setName('');
                setDescription('');
              }
            }}
            disabled={!name.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}