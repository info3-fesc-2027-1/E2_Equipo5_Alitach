// Logo de Alitachs dibujado con SVG: sello, monograma AL, aguja e hilo verde 
import { Abril_Fatface, Cormorant_Garamond, Playfair_Display } from "next/font/google";

const abril = Abril_Fatface({ weight: "400", subsets: ["latin"] });
const playfair = Playfair_Display({ weight: "700", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ weight: "500", subsets: ["latin"] });

export function LogoAlitachs({ className }) {
    return (
        <svg viewBox="300 300 1000 1000" className={className} role="img" aria-label="Logo de Alitachs">
            <defs>
                <path id="logo-arco-arriba" d="M 410 800 A 390 390 0 0 1 1190 800" />
                <path id="logo-arco-abajo" d="M 360 800 A 440 440 0 0 0 1240 800" />
            </defs>
            <circle cx="800" cy="800" r="498" fill="#F0F0F0" />
            <circle cx="800" cy="800" r="467" fill="none" stroke="#3A5F9A" strokeWidth="3" />
            <circle cx="800" cy="800" r="365" fill="none" stroke="#0E1F45" strokeWidth="2.4" />
            <text fontFamily={abril.style.fontFamily} fontSize="74" fill="#3A5F9A" letterSpacing="34">
                <textPath href="#logo-arco-arriba" startOffset="50%" textAnchor="middle">
                    ALITACHS
                </textPath>
            </text>
            <path
                d={
                    "M 483 632 C 500 662, 535 668, 560 640 C 590 606, 640 576, 690 600 " +
                    "C 760 640, 820 760, 870 815 C 920 845, 990 830, 1015 770 " + 
                    "C 1050 680, 1035 560, 975 553 C 915 548, 915 640, 950 700 " + 
                    "C 985 765, 1040 852, 1115 840"
                } 
                fill="none" 
                stroke="#7DD957" 
                strokeWidth="7" 
                strokeLinecap="round" 
            />      
            <g fontFamily={playfair.style.fontFamily} fontWeight="700" fill="#3A5F9A">        
                <text x="728" y="862" fontSize="440" textAnchor="middle">          
                    A        
                </text>        
                <text x="905" y="965" fontSize="430" textAnchor="middle">          
                    L        
                </text>      
                </g>      
                <path d="M 737 1083 L 525.5 614 A 9.5 9.5 0 0 1 543 606.5 Z" fill="#071733" />      
                <path d="M 540 622 L 561 671" stroke="#F0F0F0" strokeWidth="5" strokeLinecap="round" />      
                <path 
                    d="M 536 662 C 548 660, 556 650, 560 640 C 566 630, 572 624, 578 620" 
                    fill="none" 
                    stroke="#7DD957" 
                    strokeWidth="7" 
                    strokeLinecap="round" 
                />      
                <text 
                    fontFamily={cormorant.style.fontFamily} 
                    fontWeight="500" fontSize="84" 
                    fill="#3A5F9A" 
                    letterSpacing="9"      
                >        
                    <textPath href="#logo-arco-abajo" startOffset="50%" textAnchor="middle">          
                        CONFECCIÓN Y COSTURA        
                    </textPath>      
                </text>    
            </svg>
        );
}