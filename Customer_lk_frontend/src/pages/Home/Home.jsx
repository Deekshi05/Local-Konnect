import Review from "./homecomp/Review.jsx";
import Choose from "./homecomp/Choose.jsx";
import Partners from "./homecomp/Partners.jsx";
import Consultation from "./homecomp/Consultation.jsx";
import '../../styles/page_styles/home_styles/home.css';  // Correct path for styles

function Home() {
  return (
    <div className="home">
      <Consultation />
      <Review />
      <Partners />
      <Choose />
    </div>
  );
}

export default Home;
