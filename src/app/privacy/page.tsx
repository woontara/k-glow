export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-gray-600 leading-relaxed">
              K-Glow는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>회원 가입 및 관리</li>
              <li>서비스 제공 및 계약 이행</li>
              <li>고객 문의 응대</li>
              <li>마케팅 및 광고 활용 (동의 시)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. 수집하는 개인정보 항목</h2>
            <p className="text-gray-600 leading-relaxed">
              K-Glow는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>필수항목: 이메일, 이름, 비밀번호</li>
              <li>선택항목: 회사명, 프로필 이미지</li>
              <li>소셜 로그인 시: 소셜 계정 이메일, 이름, 프로필 이미지</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-gray-600 leading-relaxed">
              K-Glow는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>회원 정보: 회원 탈퇴 시까지</li>
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. 개인정보의 제3자 제공</h2>
            <p className="text-gray-600 leading-relaxed">
              K-Glow는 정보주체의 개인정보를 개인정보의 수집·이용 목적에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등의 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. 정보주체의 권리·의무 및 행사방법</h2>
            <p className="text-gray-600 leading-relaxed">
              정보주체는 K-Glow에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. 개인정보의 안전성 확보조치</h2>
            <p className="text-gray-600 leading-relaxed">
              K-Glow는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>개인정보의 암호화</li>
              <li>해킹 등에 대비한 기술적 대책</li>
              <li>개인정보에 대한 접근 제한</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. 개인정보 보호책임자</h2>
            <p className="text-gray-600 leading-relaxed">
              K-Glow는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-gray-50 p-4 rounded mt-2">
              <p className="text-gray-600">이메일: didwk89@gmail.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. 개인정보처리방침의 변경</h2>
            <p className="text-gray-600 leading-relaxed">
              이 개인정보처리방침은 2024년 1월 1일부터 적용됩니다. 변경사항이 있을 경우 웹사이트를 통해 공지할 예정입니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
