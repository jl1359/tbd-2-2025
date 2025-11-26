import React, { useState } from 'react';

const Form = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col items-center mt-8 bg-[#005B30] p-8 rounded-xl">
      <button className="text-[32px] font-[Berlin Sans FB Demi] font-bold text-[#06B060] mb-4">Crear Cuenta</button>
      <input
        type="email"
        placeholder="Correo electrónico o número de teléfono"
        className="mb-4 p-4 bg-[#E9FFD950] text-[#454343] font-[Inter] text-[23px] rounded-md"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        className="mb-4 p-4 bg-[#E9FFD950] text-[#454343] font-[Inter] text-[23px] rounded-md"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <a href="#" className="text-[#FFFFFF] text-[23px] font-medium mb-4">¿Has olvidado tu contraseña?</a>
      <button className="w-full p-4 bg-[#06B060] text-white text-[26px] font-[Berlin Sans FB Demi] font-bold">Iniciar sesión</button>
    </div>
  );
};

export default Form;