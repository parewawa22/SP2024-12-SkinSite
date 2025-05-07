import NavBar from "/components/NavBar";
import Homepage from "/components/Homepage";
import Routine from "/components/Routine";
import Footer from "/components/Footer";

export default function Home() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inria+Serif:wght@300;400;700&display=swap" rel="stylesheet"></link>
      <NavBar />
      <main>
        <Homepage />
        <Routine />
      </main>
      <Footer />
    </>
  );
}
