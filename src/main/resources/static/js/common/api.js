
const Api= {
  //  JSON 전용 요청
      async postRequest(url, data = null, method = "POST") {
          const options = {
              method: method,
              headers: { "Content-Type": "application/json" },
              credentials: "include",
          };

          if (data !== null && method.toUpperCase() !== "GET") {
              options.body = JSON.stringify(data);
          }

          return await this._handleResponse(url, options);
      },

       // FormData 전용 요청
      async formRequest(url, formData, method = "POST") {
           const token = localStorage.getItem('token');
           const options = {
               method: method,
               headers: {
                   ...(token && { "Authorization": `Bearer ${token}` })
               },
               body: formData,
               credentials: "include",
           };
           return await this._handleResponse(url, options);
       },

       // 내부 공통 응답 처리기
       async _handleResponse(url, options) {
           const response = await fetch(url, options);

           // 204 No Content 같은 경우를 대비해 텍스트로 먼저 받음
           const text = await response.text();
           const result = text ? JSON.parse(text) : null;

           if (!response.ok) {
               if (response.status === 401) throw new Error("로그인이 필요합니다.");

               let errorMessage = "요청에 실패했습니다.";
               if (result) {
                   if (Array.isArray(result.data)) errorMessage = result.data.join("\n");
                   else if (result.message) errorMessage = result.message;
               }
               const error = new Error(errorMessage);
               error.status = response.status;
               throw error;
           }
           return result;
       }
};



// 에러 렌더링 함수
function renderErrors(errors) {

    const [errors, setErrors] = useState([]);
    
   {errors.length > 0 && (
    <div id="error-container" style={{ display: 'block' }}>
        <div id="error-messages">
        {errors.map((msg, index) => (
            <div key={index} className="error-item">
            {msg}
            </div>
        ))}
        </div>
    </div>
    )}

    if (!container || !messageBox) return;

    messageBox.innerHTML = ''; // 초기화

   
    container.style.display = 'block';
    window.scrollTo(0, 0); // 상단으로 스크롤하여 에러 확인 유도
}
