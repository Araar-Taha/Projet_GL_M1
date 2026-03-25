import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EvolutionPrixChart = ({ data }) => {
  return (
    <div>
      <h3>Évolution du Prix au m²</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="année" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="prix" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvolutionPrixChart;