import React from 'react';
import Header from '../components/Header';
import Form from '../components/Form';
import ImageSlider from '../components/ImageSlider';

const Home = () => {
  return (
    <div className="bg-[#024023] min-h-screen text-white">
      <Header />
      <div className="flex justify-between px-8 py-8">
        <ImageSlider />
        <Form />
      </div>
    </div>
  );
};

export default Home;