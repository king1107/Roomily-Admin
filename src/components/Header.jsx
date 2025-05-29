import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { FiBell } from "react-icons/fi";
import { BiUserCircle } from "react-icons/bi";
import { FiUser, FiMail, FiList } from "react-icons/fi";

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // const closeDropdown = () => {
    //     setIsDropdownOpen(false);
    // };

    const navigate = useNavigate();
    const handleLogout = () => {
      localStorage.removeItem('accessToken');
      navigate('/');
    };

    // Effect to handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close dropdown if clicked outside of dropdown and outside the button
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        // Add event listener when dropdown is open
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup function to remove event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]); // Re-run effect when dropdown state changes

    return (
        <div className="flex justify-end items-center p-4 bg-white shadow-md rounded-2xl mb-4">
            <div className="flex justify-between items-center relative">
                <span className="text-black">Welcome, Admin</span>
                <div className="relative">
                    <BiUserCircle 
                        className="text-3xl ml-4 cursor-pointer" 
                        onClick={toggleDropdown}
                        ref={buttonRef}
                    />
                    
                    {isDropdownOpen && (
                        <div 
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                        >
                            <div className="py-1">
                                <div className="px-4 py-3">
                                    <button onClick={handleLogout} className="w-full text-center px-4 py-2 text-sm text-blue-500 border border-blue-500 rounded-md hover:bg-blue-50">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;