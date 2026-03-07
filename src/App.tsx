import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Stats from './sections/Stats';
import Services from './sections/Services';
import Team from './sections/Team';
import Partners from './sections/Partners';
import Contact from './sections/Contact';
import Token from './sections/Token';
import Footer from './sections/Footer';
import Article from './sections/Article';
import AdminLogin from './sections/AdminLogin';
import AdminPanel from './sections/AdminPanel';
import UserRegister from './sections/UserRegister';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './hooks/useAuth';
import './i18n';

// Sample article data for demonstration
const sampleArticle = {
  title: 'FAC荣获2024年度香港最佳创新服务平台奖',
  date: '2024-03-04',
  author: 'FAC编辑部',
  image: '/about-team.jpg',
  content: `
    <p>香港中科創新中心有限公司（FAC）近日荣获"2024年度香港最佳创新服务平台奖"，这是对公司多年来在科技创新领域持续努力的充分肯定。</p>
    
    <h2>专业交付，资源赋能</h2>
    <p>作为香港领先的创新中心，FAC始终秉承"专业交付，资源赋能"的理念，致力于连接科技、资本与人才，为企业提供从战略咨询到落地执行的全链条服务。</p>
    
    <p>自成立以来，FAC已成功交付超过50个创新项目，与全球100多家机构建立战略合作关系，汇聚了30多位资深行业专家，服务超过500家企业客户。</p>
    
    <h2>全方位服务体系</h2>
    <p>FAC建立了完善的创新服务体系，涵盖四大核心板块：</p>
    
    <ul>
      <li><strong>创新咨询</strong>：为企业提供战略规划、市场分析、技术路线规划等专业咨询服务</li>
      <li><strong>孵化加速</strong>：为初创企业提供全方位孵化服务，包括办公空间、导师辅导、资源对接</li>
      <li><strong>技术转移</strong>：促进科研成果产业化，搭建产学研合作桥梁</li>
      <li><strong>投资对接</strong>：连接优质项目与资本，提供全周期融资服务</li>
    </ul>
    
    <h2>展望未来</h2>
    <p>未来，FAC将继续深耕香港创新生态，依托香港国际化的区位优势，连接全球科技资源与资本市场，助力更多企业实现数字化转型与可持续增长。</p>
    
    <p>我们相信，通过持续的专业交付与资源赋能，FAC将成为更多企业创新发展的最佳合作伙伴。</p>
  `
};

function App() {
  const { i18n } = useTranslation();
  const { auth, isLoaded: authLoaded } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'article' | 'admin' | 'register' | 'wallet' | 'profile'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/register' || p === '/login') return 'register';
      if (p === '/wallet') return 'wallet';
      if (p === '/profile') return 'profile';
    }
    return 'home';
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Check URL for admin / register / wallet
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/wallet') {
      setCurrentView('wallet');
      return;
    }
    if (path === '/profile') {
      setCurrentView('profile');
      return;
    }
    if (path === '/register' || path === '/login') {
      setCurrentView('register');
      return;
    }
    if (path.startsWith('/admin') || path === '/admin' || hash === '#admin') {
      setCurrentView('admin');
      if (hash === '#admin' && path !== '/admin' && !path.startsWith('/admin/')) {
        window.history.replaceState({}, '', '/admin');
      }
    }
  }, []);

  // Handle language change
  useEffect(() => {
    const handleLanguageChange = () => {
      // Re-render when language changes
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  if (isLoading || !authLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-4">
            F<span className="text-[#FFD700]">A</span>C
          </div>
          <div className="w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#FFD700] animate-[shimmer_1s_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  // Admin route (/admin or /admin/tokens)
  if (currentView === 'admin' || window.location.pathname.startsWith('/admin')) {
    if (!auth.isAuthenticated) {
      return <AdminLogin onLogin={() => {}} />;
    }
    return <AdminPanel onLogout={() => setCurrentView('home')} />;
  }

  // User register / login (/register, /login)
  if (currentView === 'register' || window.location.pathname === '/register' || window.location.pathname === '/login') {
    return (
      <UserRegister
        onBack={() => {
          setCurrentView('home');
          window.history.replaceState({}, '', '/');
        }}
      />
    );
  }

  // Wallet 流水賬 (/wallet)
  if (currentView === 'wallet' || window.location.pathname === '/wallet') {
    return (
      <WalletPage
        onBack={() => {
          setCurrentView('home');
          window.history.replaceState({}, '', '/');
        }}
      />
    );
  }

  if (currentView === 'profile' || window.location.pathname === '/profile') {
    return (
      <ProfilePage
        onBack={() => {
          setCurrentView('home');
          window.history.replaceState({}, '', '/');
        }}
      />
    );
  }

  if (currentView === 'article') {
    return (
      <Article
        title={sampleArticle.title}
        content={sampleArticle.content}
        date={sampleArticle.date}
        author={sampleArticle.author}
        image={sampleArticle.image}
        onBack={() => setCurrentView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Stats />
        <Services />
        <Token />
        <Team />
        <Partners />
        <Contact />
      </main>
      <Footer />
      
      {/* Demo button to show article view */}
      <button
        onClick={() => setCurrentView('article')}
        className="fixed bottom-8 right-8 z-40 px-4 py-2 bg-[#FFD700]/20 text-[#FFD700] rounded-lg text-sm hover:bg-[#FFD700]/30 transition-colors duration-300"
      >
        查看文章页
      </button>
    </div>
  );
}

export default App;
