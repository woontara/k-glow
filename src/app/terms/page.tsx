export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">서비스 이용약관</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              이 약관은 K-Glow(이하 &quot;회사&quot;)가 제공하는 한국 화장품 러시아 수출 플랫폼 서비스(이하 &quot;서비스&quot;)의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제2조 (정의)</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>&quot;서비스&quot;란 회사가 제공하는 한국 화장품 러시아 수출 관련 모든 서비스를 의미합니다.</li>
              <li>&quot;회원&quot;이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 말합니다.</li>
              <li>&quot;아이디(ID)&quot;란 회원 식별과 서비스 이용을 위해 회원이 설정하고 회사가 승인한 이메일 주소를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력을 발생합니다.</li>
              <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
              <li>약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 공지합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제4조 (서비스의 제공)</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              회사는 다음과 같은 서비스를 제공합니다.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>한국 화장품 러시아 수출 컨설팅</li>
              <li>러시아 인증(EAC) 대행 서비스</li>
              <li>러시아 바이어 매칭 서비스</li>
              <li>제품 현지화 서비스</li>
              <li>수출 견적 계산 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제5조 (회원가입)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>서비스를 이용하고자 하는 자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
              <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 자가 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제6조 (회원의 의무)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>회원은 관계법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 합니다.</li>
              <li>회원은 회사의 사전 승낙 없이 서비스를 이용하여 영업활동을 할 수 없습니다.</li>
              <li>회원은 서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복사, 복제, 변경, 번역, 출판, 방송 기타의 방법으로 사용하거나 제3자에게 제공할 수 없습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제7조 (회사의 의무)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>회사는 관련 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를 제공하기 위해 노력합니다.</li>
              <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보 보호를 위한 보안시스템을 갖추어야 합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제8조 (서비스 이용의 제한 및 중지)</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 중지할 수 있습니다.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>서비스용 설비의 보수 등 공사로 인한 부득이한 경우</li>
              <li>회원이 회사의 영업활동을 방해하는 경우</li>
              <li>정전, 제반 설비의 장애 또는 이용량의 폭주 등으로 정상적인 서비스 이용에 지장이 있는 경우</li>
              <li>기타 천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제9조 (면책조항)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 대한 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제10조 (분쟁해결)</h2>
            <p className="text-gray-600 leading-relaxed">
              회사와 회원 간에 발생한 분쟁에 관한 소송은 대한민국 법을 준거법으로 하며, 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">부칙</h2>
            <p className="text-gray-600 leading-relaxed">
              이 약관은 2024년 1월 1일부터 시행합니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
