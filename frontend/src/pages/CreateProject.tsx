import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft } from 'lucide-react'

export default function CreateProject() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .insert([{ name, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      navigate(`/dashboard/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>

        <div className="card">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
          <p className="text-slate-400 mb-8">
            Set up a new monitoring project for your application or service
          </p>

          {error && (
            <div className="p-4 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="My Production API"
                required
              />
              <p className="text-slate-500 text-sm mt-2">
                Choose a descriptive name for the system you want to monitor
              </p>
            </div>

            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">What you'll get:</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>✅ Real-time metrics dashboard</li>
                <li>✅ AI-powered predictions</li>
                <li>✅ Anomaly detection</li>
                <li>✅ Log pattern analysis</li>
                <li>✅ Slack alerts</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
