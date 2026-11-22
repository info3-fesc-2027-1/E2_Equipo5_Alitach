// Maniquí de costura dibujado a tinta para el encabezado del Panel. 
// Los trazos se dibujan solos al abrir la pantalla (estilos en cuaderno.css). 
// Solo decora: en el celular se oculta. 

const CUERPO =    
    "M96 44 C80 47 58 54 50 66 C43 76 47 92 55 103 C60 126 73 143 80 152 C70 166 62 182 66 200 " +    
    "L154 200 C158 182 150 166 140 152 C147 143 160 126 165 103 C173 92 177 76 170 66 C162 54 140 47 124 44 Z"; 
    
// Cuello y base del maniquí 
const PIE = "M96 44 L96 26 M124 44 L124 26 M110 200 L110 244 M110 244 L82 262 M110 244 L138 262 M110 244 L110 258"; 
// Costuras punteadas del frente 
const COSTURAS =    
    "M110 48 L110 196 M84 62 C86 100 92 130 92 152 C90 168 88 184 88 198 " +    
    "M136 62 C134 100 128 130 128 152 C130 168 132 184 132 198"; 
const CINTA = "M100 42 C92 62 88 90 86 122 M120 42 C128 62 134 94 138 126"; 

export function Maniqui() {    
    return (        
        <div className="maniqui" aria-hidden="true">            
            <svg viewBox="0 0 230 270">                
                <path className="relleno" d={CUERPO} />                
                <path className="trazo dibuja" pathLength="1" d={CUERPO} />                
                <path                    
                    className="trazo dibuja"                    
                    pathLength="1"                    
                    d={PIE}                
                />                
                <ellipse                    
                    className="trazo dibuja"                    
                    pathLength="1"                    
                    cx="110"                    
                    cy="24"                    
                    rx="15"                    
                    ry="4.5"                
                />                
                <ellipse className="trazo dibuja" pathLength="1" cx="110" cy="200" rx="44" ry="7" />                
                <path                    
                    className="costura-m aparece-m"                    
                    d={COSTURAS}                
                />                
                <path className="cinta-m aparece-m" d={CINTA} />                
                <path className="cinta-marcas aparece-m" d={CINTA} />                
                <path                    
                    className="medida aparece-m"                    
                    d="M40 96 L182 96 M66 150 L156 150 M56 186 L166 186"                
                />                
                <text className="aparece-m" x="186" y="100">                    
                    busto                
                </text>                
                <text className="aparece-m" x="160" y="154">                    
                    cintura                
                </text>                
                <text className="aparece-m" x="170" y="190">                    
                    cadera                
                </text>            
            </svg>        
        </div>    
    ); 
}