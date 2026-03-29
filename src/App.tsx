import NavBar from '@/components/NavBar'
import VideoEditor from '@/components/VideoEditor'
import './App.css'

function App() {
    return (
        <>
            <NavBar />
            <main className="flex-1 flex flex-col min-w-0">
                <VideoEditor />
            </main>
        </>
    )
}

export default App
