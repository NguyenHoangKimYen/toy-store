import React from 'react'

const Account = () => {
    return (
        <div className='border-b mb-4 mt-2 pb-4 border-stone-300'>
            <button className='flex p-3 cursor-pointer hover:bg-stone-400 rounded-md transition-colors relative gap-2 w-full items-center'>
                <img src='https://scontent.fsgn5-11.fna.fbcdn.net/v/t39.30808-6/480735419_653448857040533_1287371868550362738_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHO8OtcfMdc6cZzv2GRp-oxIqtV1ypJH2wiq1XXKkkfbIjYwQZbTXbnbN3XJoF1rmb-3U_j_qPd5BUOH4a-1jUa&_nc_ohc=jD5qCnUN0CEQ7kNvwFlXrUr&_nc_oc=AdkXQcdSs7knqZ7ULDrSkpEMGRJEpDnRUEWUwK1ZJJuz_RAVfDVMgjwMLL22K6S6yjY&_nc_zt=23&_nc_ht=scontent.fsgn5-11.fna&_nc_gid=LSBl4c3Rq_R0oOwORa6x-g&oh=00_AfgQEaM_P3IjYkPG2qkztOLagXwiPAdbmOTgFWVADk87yw&oe=690E9567' alt='pfp' className='size-8 rounded shrink-0 shadow'></img>

                <div className='text-start'>
                    <span className='text-sm font-bold block'>Bao Ngo</span>
                    <span className='text-xs block text-stone-500'>myemail123@gmail.com</span>
                </div>

                <svg className='size-3 ml-auto mr-2' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.70711 16.1359C5.31659 16.5264 5.31659 17.1596 5.70711 17.5501L10.5993 22.4375C11.3805 23.2179 12.6463 23.2176 13.4271 22.4369L18.3174 17.5465C18.708 17.156 18.708 16.5228 18.3174 16.1323C17.9269 15.7418 17.2937 15.7418 16.9032 16.1323L12.7176 20.3179C12.3271 20.7085 11.6939 20.7085 11.3034 20.3179L7.12132 16.1359C6.7308 15.7454 6.09763 15.7454 5.70711 16.1359Z" fill="#0F0F0F"></path> <path d="M18.3174 7.88675C18.708 7.49623 18.708 6.86307 18.3174 6.47254L13.4252 1.58509C12.644 0.804698 11.3783 0.805008 10.5975 1.58579L5.70711 6.47615C5.31658 6.86667 5.31658 7.49984 5.70711 7.89036C6.09763 8.28089 6.7308 8.28089 7.12132 7.89036L11.307 3.70472C11.6975 3.31419 12.3307 3.31419 12.7212 3.70472L16.9032 7.88675C17.2937 8.27728 17.9269 8.27728 18.3174 7.88675Z" fill="#0F0F0F"></path> </g></svg>
            </button>
        </div>
    )
}

export default Account
