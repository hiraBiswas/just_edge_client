
import Banner from "../../Component/Banner/Banner";
import CourseContainer from "../../Component/CourseContainer/CourseContainer";



const Home = () => {

  return (
    <div>
      <Banner></Banner>
     <div className="container mx-auto">
     <CourseContainer></CourseContainer>
     </div>
     
    </div>
  );
};

export default Home;
